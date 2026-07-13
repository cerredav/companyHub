import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  openDb,
  listSnapshot,
  listChanges,
  upsertRecord,
  deleteRecord,
  upsertFile,
  deleteFile,
  getFileBlob,
  isRecordCollection,
} from './db.js'
import {
  defaultPassword,
  defaultTokenSecret,
  issueToken,
  parseBearerAuthorization,
  passwordsMatch,
  secretsMatch,
  verifyToken,
} from './auth.js'

const defaultDbPath = join(dirname(fileURLToPath(import.meta.url)), 'data', 'hub.sqlite')

/** GitHub Pages site https://cerredav.github.io/companyHub/ → browser Origin is host only */
export const PAGES_ORIGIN = 'https://cerredav.github.io'

const DEFAULT_CORS_ORIGINS = [PAGES_ORIGIN, 'http://localhost:5173']

const CORS_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Parent-Type',
  'X-Parent-Id',
  'X-Name',
  'X-Mime-Type',
  'X-Size',
  'X-Updated-At',
].join(', ')

const CORS_METHODS = 'GET,HEAD,PUT,POST,DELETE,OPTIONS'

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeCorsOrigin)
}

/** Origin never includes a path — https://host/companyHub/ → https://host */
function normalizeCorsOrigin(entry) {
  try {
    return new URL(entry).origin
  } catch {
    return String(entry).replace(/\/+$/, '')
  }
}

function resolveAllowedOrigins(corsOrigins) {
  const extra = Array.isArray(corsOrigins)
    ? corsOrigins
    : parseCorsOrigins(corsOrigins)
  return [...new Set([
    ...DEFAULT_CORS_ORIGINS,
    ...parseCorsOrigins(process.env.CORS_ORIGINS),
    ...extra.map(normalizeCorsOrigin),
  ])]
}

function applyCorsHeaders(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', CORS_METHODS)
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS)
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('Vary', 'Origin')
}

export function createApp({
  dbPath = defaultDbPath,
  corsOrigins = [],
  password = defaultPassword(),
  tokenSecret = defaultTokenSecret(),
  // ponytail: inject null in tests to keep the suite quiet
  log = process.env.NODE_ENV === 'test' ? null : (...args) => console.log(...args),
} = {}) {
  const db = openDb(dbPath)
  const app = express()
  const allowedOrigins = resolveAllowedOrigins(corsOrigins)

  if (log) {
    app.use((req, res, next) => {
      const started = Date.now()
      res.on('finish', () => {
        // Never log Authorization or bodies — password/secret live there
        log(JSON.stringify({
          ts: new Date().toISOString(),
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          ms: Date.now() - started,
          origin: req.headers.origin || null,
        }))
      })
      next()
    })
  }

  // CORS first — Pages Origin + OPTIONS preflight (204) before auth
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && allowedOrigins.includes(origin)) {
      applyCorsHeaders(res, origin)
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  // Every /api route except health requires Authorization: Bearer <HUB_TOKEN_SECRET> [...]
  app.use('/api', (req, res, next) => {
    if (req.method === 'OPTIONS' || req.path === '/health') return next()
    const parsed = parseBearerAuthorization(req.get('authorization'))
    if (!parsed || !secretsMatch(parsed.apiSecret, tokenSecret)) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    req.hubSessionToken = parsed.sessionToken
    next()
  })

  app.post('/api/auth/login', express.json({ limit: '4kb' }), (req, res) => {
    if (!passwordsMatch(req.body?.password, password)) {
      return res.status(401).json({ error: 'invalid_password' })
    }
    const issued = issueToken(tokenSecret)
    return res.json(issued)
  })

  // Data routes also require a valid session token after login
  app.use('/api', (req, res, next) => {
    if (req.method === 'OPTIONS' || req.path === '/health' || req.path === '/auth/login') {
      return next()
    }
    if (!verifyToken(req.hubSessionToken, tokenSecret)) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    next()
  })

  app.get('/api/snapshot', (_req, res) => {
    res.json(listSnapshot(db))
  })

  app.get('/api/changes', (req, res) => {
    const since = req.query.since || ''
    res.json(listChanges(db, since))
  })

  app.put('/api/records/:collection/:id', express.json({ limit: '10mb' }), (req, res) => {
    const { collection, id } = req.params
    if (!isRecordCollection(collection)) {
      return res.status(400).json({ error: 'invalid_collection' })
    }
    try {
      const result = upsertRecord(db, collection, id, req.body)
      if (!result.ok) return res.status(409).json({ error: result.reason })
      return res.json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  app.delete('/api/records/:collection/:id', (req, res) => {
    const { collection, id } = req.params
    if (!isRecordCollection(collection)) {
      return res.status(400).json({ error: 'invalid_collection' })
    }
    deleteRecord(db, collection, id)
    return res.json({ ok: true })
  })

  app.put('/api/files/:id', express.raw({ type: () => true, limit: '200mb' }), (req, res) => {
    const { id } = req.params
    const meta = {
      id,
      parentType: req.get('x-parent-type') || '',
      parentId: req.get('x-parent-id') || '',
      name: req.get('x-name') || 'file',
      mimeType: req.get('x-mime-type') || 'application/octet-stream',
      size: Number(req.get('x-size') || req.body?.length || 0),
      updatedAt: req.get('x-updated-at') || new Date().toISOString(),
    }
    if (!meta.parentType || !meta.parentId) {
      return res.status(400).json({ error: 'missing_parent' })
    }
    try {
      const result = upsertFile(db, meta, req.body)
      if (!result.ok) return res.status(409).json({ error: result.reason })
      return res.json({ ok: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  })

  app.get('/api/files/:id/blob', (req, res) => {
    const row = getFileBlob(db, req.params.id)
    if (!row) return res.status(404).json({ error: 'not_found' })
    res.setHeader('Content-Type', row.mimeType)
    res.setHeader('Content-Disposition', `inline; filename="${row.name}"`)
    return res.send(row.blob)
  })

  app.delete('/api/files/:id', (req, res) => {
    deleteFile(db, req.params.id)
    return res.json({ ok: true })
  })

  app._closeDb = () => db.close()
  app._db = db
  app._tokenSecret = tokenSecret
  return app
}

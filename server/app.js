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

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function createApp({
  dbPath = defaultDbPath,
  corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS),
  password = defaultPassword(),
  tokenSecret = defaultTokenSecret(),
} = {}) {
  const db = openDb(dbPath)
  const app = express()

  // ponytail: allow Pages/localhost without a cors dependency
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS)
      res.setHeader('Vary', 'Origin')
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  // Every /api route except health requires Authorization: Bearer <HUB_TOKEN_SECRET> [...]
  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next()
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
    if (req.path === '/health' || req.path === '/auth/login') return next()
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

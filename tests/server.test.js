/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from '../server/app.js'
import { issueToken } from '../server/auth.js'

const PASSWORD = 'test-hub-password'
const TOKEN_SECRET = 'test-token-secret'

let dbPath
let app
let tmpDir
let authHeader

function secretHeader() {
  return `Bearer ${TOKEN_SECRET}`
}

function sessionHeader(sessionToken) {
  return `Bearer ${TOKEN_SECRET} ${sessionToken}`
}

async function login(agentApp = app, password = PASSWORD) {
  const res = await request(agentApp)
    .post('/api/auth/login')
    .set('Authorization', secretHeader())
    .send({ password })
    .expect(200)
  return sessionHeader(res.body.token)
}

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), 'hub-'))
  dbPath = join(tmpDir, 'test.sqlite')
  app = createApp({
    dbPath,
    password: PASSWORD,
    tokenSecret: TOKEN_SECRET,
  })
  authHeader = await login()
})

afterEach(() => {
  app._closeDb?.()
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('server API', () => {
  it('upserts and returns records in snapshot', async () => {
    const record = {
      id: 'p1',
      name: 'Travel Policy',
      notes: '',
      updatedAt: '2026-01-02T00:00:00.000Z',
    }

    await request(app)
      .put('/api/records/policies/p1')
      .set('Authorization', authHeader)
      .send(record)
      .expect(200)

    const snap = await request(app)
      .get('/api/snapshot')
      .set('Authorization', authHeader)
      .expect(200)
    expect(snap.body.records).toHaveLength(1)
    expect(snap.body.records[0].data.name).toBe('Travel Policy')
  })

  it('rejects stale writes with 409', async () => {
    await request(app)
      .put('/api/records/policies/p1')
      .set('Authorization', authHeader)
      .send({ id: 'p1', name: 'New', updatedAt: '2026-06-01T00:00:00.000Z' })
      .expect(200)

    await request(app)
      .put('/api/records/policies/p1')
      .set('Authorization', authHeader)
      .send({ id: 'p1', name: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' })
      .expect(409)
  })

  it('delete produces a tombstone visible in changes', async () => {
    await request(app)
      .put('/api/records/policies/p1')
      .set('Authorization', authHeader)
      .send({ id: 'p1', name: 'X', updatedAt: '2026-01-01T00:00:00.000Z' })
      .expect(200)

    await request(app).delete('/api/records/policies/p1').set('Authorization', authHeader).expect(200)

    const changes = await request(app)
      .get('/api/changes?since=2020-01-01T00:00:00.000Z')
      .set('Authorization', authHeader)
      .expect(200)

    expect(changes.body.deletions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ collection: 'policies', id: 'p1' }),
      ])
    )
  })

  it('round-trips binary file upload and download', async () => {
    const bytes = Buffer.from('hello policy pdf')
    const updatedAt = '2026-03-01T00:00:00.000Z'

    await request(app)
      .put('/api/files/f1')
      .set('Authorization', authHeader)
      .set('X-Parent-Type', 'policy')
      .set('X-Parent-Id', 'p1')
      .set('X-Name', 'policy.pdf')
      .set('X-Mime-Type', 'application/pdf')
      .set('X-Size', String(bytes.length))
      .set('X-Updated-At', updatedAt)
      .send(bytes)
      .expect(200)

    const snap = await request(app)
      .get('/api/snapshot')
      .set('Authorization', authHeader)
      .expect(200)
    expect(snap.body.files[0].name).toBe('policy.pdf')

    const blob = await request(app)
      .get('/api/files/f1/blob')
      .set('Authorization', authHeader)
      .expect(200)
    expect(blob.body.toString()).toBe('hello policy pdf')
  })

  it('allows CORS for Pages origin and answers OPTIONS with 204', async () => {
    // Pages Origin is always allowed — no corsOrigins override needed
    const corsApp = createApp({
      dbPath: join(tmpDir, 'cors.sqlite'),
      password: PASSWORD,
      tokenSecret: TOKEN_SECRET,
    })
    try {
      const preflight = await request(corsApp)
        .options('/api/auth/login')
        .set('Origin', 'https://cerredav.github.io')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'authorization,content-type')
        .expect(204)

      expect(preflight.headers['access-control-allow-origin']).toBe('https://cerredav.github.io')
      expect(preflight.headers['access-control-allow-methods']).toMatch(/POST/i)
      expect(preflight.headers['access-control-allow-headers']).toMatch(/Authorization/i)

      const login = await request(corsApp)
        .post('/api/auth/login')
        .set('Origin', 'https://cerredav.github.io')
        .set('Authorization', secretHeader())
        .send({ password: PASSWORD })
        .expect(200)

      expect(login.headers['access-control-allow-origin']).toBe('https://cerredav.github.io')
    } finally {
      corsApp._closeDb?.()
    }
  })

  it('login requires API secret; returns session; wrong password is 401', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ password: PASSWORD })
      .expect(401)

    await request(app)
      .post('/api/auth/login')
      .set('Authorization', 'Bearer wrong-secret')
      .send({ password: PASSWORD })
      .expect(401)

    const ok = await request(app)
      .post('/api/auth/login')
      .set('Authorization', secretHeader())
      .send({ password: PASSWORD })
      .expect(200)

    expect(ok.body.token).toBeTruthy()
    expect(ok.body.expiresAt).toBeTruthy()

    await request(app)
      .get('/api/snapshot')
      .set('Authorization', sessionHeader(ok.body.token))
      .expect(200)

    await request(app)
      .post('/api/auth/login')
      .set('Authorization', secretHeader())
      .send({ password: 'wrong' })
      .expect(401)
  })

  it('rejects protected routes without secret, session, or with expired session', async () => {
    await request(app).get('/api/snapshot').expect(401)

    await request(app)
      .get('/api/snapshot')
      .set('Authorization', secretHeader())
      .expect(401)

    const { token } = issueToken(TOKEN_SECRET, Date.now() - 48 * 60 * 60 * 1000)
    await request(app)
      .get('/api/snapshot')
      .set('Authorization', sessionHeader(token))
      .expect(401)

    await request(app).get('/api/health').expect(200)
  })

  it('logs request method, path, and response status', async () => {
    const lines = []
    const logged = createApp({
      dbPath: join(tmpDir, 'log.sqlite'),
      password: PASSWORD,
      tokenSecret: TOKEN_SECRET,
      log: (line) => lines.push(line),
    })
    try {
      await request(logged).get('/api/health').expect(200)
      // finish event is async relative to expect — wait a tick
      await new Promise((r) => setImmediate(r))

      expect(lines).toHaveLength(1)
      const entry = JSON.parse(lines[0])
      expect(entry).toMatchObject({
        method: 'GET',
        path: '/api/health',
        status: 200,
      })
      expect(typeof entry.ms).toBe('number')
      expect(entry.ts).toBeTruthy()
    } finally {
      logged._closeDb?.()
    }
  })
})

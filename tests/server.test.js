/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createApp } from '../server/app.js'

let dbPath
let app
let tmpDir

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'hub-'))
  dbPath = join(tmpDir, 'test.sqlite')
  app = createApp({ dbPath })
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
      .send(record)
      .expect(200)

    const snap = await request(app).get('/api/snapshot').expect(200)
    expect(snap.body.records).toHaveLength(1)
    expect(snap.body.records[0].data.name).toBe('Travel Policy')
  })

  it('rejects stale writes with 409', async () => {
    await request(app)
      .put('/api/records/policies/p1')
      .send({ id: 'p1', name: 'New', updatedAt: '2026-06-01T00:00:00.000Z' })
      .expect(200)

    await request(app)
      .put('/api/records/policies/p1')
      .send({ id: 'p1', name: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' })
      .expect(409)
  })

  it('delete produces a tombstone visible in changes', async () => {
    await request(app)
      .put('/api/records/policies/p1')
      .send({ id: 'p1', name: 'X', updatedAt: '2026-01-01T00:00:00.000Z' })
      .expect(200)

    const before = await request(app).get('/api/snapshot').expect(200)
    await request(app).delete('/api/records/policies/p1').expect(200)

    const changes = await request(app)
      .get('/api/changes?since=2020-01-01T00:00:00.000Z')
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
      .set('X-Parent-Type', 'policy')
      .set('X-Parent-Id', 'p1')
      .set('X-Name', 'policy.pdf')
      .set('X-Mime-Type', 'application/pdf')
      .set('X-Size', String(bytes.length))
      .set('X-Updated-At', updatedAt)
      .send(bytes)
      .expect(200)

    const snap = await request(app).get('/api/snapshot').expect(200)
    expect(snap.body.files[0].name).toBe('policy.pdf')

    const blob = await request(app).get('/api/files/f1/blob').expect(200)
    expect(blob.body.toString()).toBe('hello policy pdf')
  })

  it('allows CORS for configured Pages origin', async () => {
    const corsApp = createApp({
      dbPath: join(tmpDir, 'cors.sqlite'),
      corsOrigins: ['https://cerredav.github.io'],
    })
    try {
      const res = await request(corsApp)
        .options('/api/snapshot')
        .set('Origin', 'https://cerredav.github.io')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204)

      expect(res.headers['access-control-allow-origin']).toBe('https://cerredav.github.io')
    } finally {
      corsApp._closeDb?.()
    }
  })
})

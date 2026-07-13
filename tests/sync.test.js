import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  db,
  clearAll,
  savePolicy,
  listPolicies,
} from '../src/db.js'
import {
  syncPull,
  flushOutbox,
  _resetSyncForTests,
  _setApplyingRemote,
  _applyPayloadForTest,
} from '../src/lib/sync.js'
import {
  AUTH_EXPIRED_EVENT,
  _setAuthForTest,
  getAuth,
  logout,
} from '../src/lib/auth.js'

function emptySnapshot() {
  return {
    serverTime: '2026-01-01T00:00:00.000Z',
    records: [],
    files: [],
    deletions: [],
  }
}

beforeEach(async () => {
  _resetSyncForTests()
  _setApplyingRemote(true)
  await clearAll()
  await db.outbox.clear()
  _setApplyingRemote(false)
  logout()
  _setAuthForTest({
    token: 'test-token',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  })
  vi.restoreAllMocks()
})

describe('client sync', () => {
  it('enqueues local writes in the outbox', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).endsWith('/api/snapshot')) {
        return { ok: true, status: 200, json: async () => emptySnapshot() }
      }
      throw new Error(`unexpected fetch: ${url}`)
    }))

    await syncPull().catch(() => {})
    await savePolicy({ name: 'Handbook', notes: '' })

    // hooks fire on transaction complete — microtask
    await new Promise((r) => setTimeout(r, 0))

    const pending = await db.outbox.toArray()
    expect(pending).toHaveLength(1)
    expect(pending[0]).toMatchObject({ op: 'put', collection: 'policies' })
  })

  it('does not enqueue while applying remote changes', async () => {
    _setApplyingRemote(true)
    await db.policies.put({
      id: 'remote-1',
      name: 'Remote',
      notes: '',
      updatedAt: '2026-06-01T00:00:00.000Z',
    })
    _setApplyingRemote(false)

    const pending = await db.outbox.toArray()
    expect(pending).toHaveLength(0)
  })

  it('applies tombstones and removes local records', async () => {
    const saved = await savePolicy({ name: 'Gone', notes: '' })
    await new Promise((r) => setTimeout(r, 0))
    await db.outbox.clear()
    _setApplyingRemote(true)
    await db.policies.put({
      ...saved,
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    _setApplyingRemote(false)

    await _applyPayloadForTest({
      serverTime: '2026-06-02T00:00:00.000Z',
      records: [],
      files: [],
      deletions: [{
        collection: 'policies',
        id: saved.id,
        deletedAt: '2026-06-02T00:00:00.000Z',
      }],
    })

    expect(await listPolicies()).toHaveLength(0)
  })

  it('flushes outbox puts to the server', async () => {
    const saved = await savePolicy({ name: 'Flush Me', notes: '' })
    await new Promise((r) => setTimeout(r, 0))
    await db.outbox.clear()
    await db.outbox.add({
      op: 'put',
      collection: 'policies',
      id: saved.id,
      queuedAt: new Date().toISOString(),
    })

    const puts = []
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (init?.method === 'PUT' && String(url).includes('/api/records/policies/')) {
        puts.push(JSON.parse(init.body))
        return { ok: true, status: 200 }
      }
      return { ok: true, status: 200, json: async () => emptySnapshot() }
    }))

    await flushOutbox()

    expect(puts).toHaveLength(1)
    expect(puts[0].name).toBe('Flush Me')
    expect(await db.outbox.toArray()).toHaveLength(0)
  })

  it('schedules a flush after local writes', async () => {
    const puts = []
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      if (init?.method === 'PUT' && String(url).includes('/api/records/policies/')) {
        puts.push(JSON.parse(init.body))
        return { ok: true, status: 200 }
      }
      if (String(url).endsWith('/api/snapshot')) {
        return { ok: true, status: 200, json: async () => emptySnapshot() }
      }
      return { ok: true, status: 200, json: async () => emptySnapshot() }
    }))

    await syncPull().catch(() => {})
    await db.outbox.clear()
    await savePolicy({ name: 'Live Sync', notes: '' })
    await new Promise((r) => setTimeout(r, 400))

    expect(puts.some((p) => p.name === 'Live Sync')).toBe(true)
    expect(await db.outbox.toArray()).toHaveLength(0)
  })

  it('sends Authorization and clears auth on 401', async () => {
    const headersSeen = []
    let expired = false
    window.addEventListener(AUTH_EXPIRED_EVENT, () => { expired = true })

    vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
      headersSeen.push(init?.headers || {})
      return { ok: false, status: 401 }
    }))

    await expect(syncPull()).rejects.toThrow(/unauthorized/)

    expect(headersSeen[0].Authorization).toBe('Bearer dev-hub-secret test-token')
    expect(getAuth()).toBeNull()
    expect(expired).toBe(true)
  })
})

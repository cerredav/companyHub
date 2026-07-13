import { db } from '../db.js'
import { importAll } from '../db.js'
import { authHeaders, notifyAuthExpired } from './auth.js'

const API = import.meta.env.VITE_API_URL || '/api'
const POLL_MS = 20_000
const FLUSH_DEBOUNCE_MS = 300

async function apiFetch(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  })
  if (res.status === 401) {
    notifyAuthExpired()
    throw new Error('unauthorized')
  }
  return res
}

export const SYNC_COLLECTIONS = [
  'documents',
  'engagements',
  'partners',
  'teamMembers',
  'policies',
  'meetings',
  'buckets',
  'agreements',
  'activities',
]

let applyingRemote = false
let hooksRegistered = false
let pollTimer = null
let flushTimer = null
let lastSyncAt = ''
let statusCallback = () => {}

function setStatus(state, detail = '') {
  statusCallback({ state, detail })
}

function isNewer(remoteAt, localAt) {
  return (remoteAt || '') > (localAt || '')
}

async function enqueue(op, collection, id) {
  if (applyingRemote) return
  const existing = await db.outbox
    .filter((row) => row.collection === collection && row.id === id && row.op === op)
    .first()
  if (existing) await db.outbox.delete(existing.seq)
  await db.outbox.add({
    op,
    collection,
    id,
    queuedAt: new Date().toISOString(),
  })
  scheduleFlush()
}

function scheduleFlush() {
  if (applyingRemote) return
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(async () => {
    flushTimer = null
    try {
      setStatus('syncing')
      await flushOutbox()
      setStatus('online')
    } catch (err) {
      setStatus('offline', err.message)
    }
  }, FLUSH_DEBOUNCE_MS)
}

function registerHooks() {
  if (hooksRegistered) return
  hooksRegistered = true

  for (const collection of SYNC_COLLECTIONS) {
    const table = db[collection]
    table.hook('creating', (primKey, _obj, trans) => {
      if (applyingRemote) return
      trans.on('complete', () => { enqueue('put', collection, primKey) })
    })
    table.hook('updating', (_mods, primKey, _obj, trans) => {
      if (applyingRemote) return
      trans.on('complete', () => { enqueue('put', collection, primKey) })
    })
    table.hook('deleting', (primKey, _obj, trans) => {
      if (applyingRemote) return
      trans.on('complete', () => { enqueue('delete', collection, primKey) })
    })
  }

  db.files.hook('creating', (primKey, _obj, trans) => {
    if (applyingRemote) return
    trans.on('complete', () => { enqueue('put', 'files', primKey) })
  })
  db.files.hook('updating', (_mods, primKey, _obj, trans) => {
    if (applyingRemote) return
    trans.on('complete', () => { enqueue('put', 'files', primKey) })
  })
  db.files.hook('deleting', (primKey, _obj, trans) => {
    if (applyingRemote) return
    trans.on('complete', () => { enqueue('delete', 'files', primKey) })
  })
}

async function applyRemoteRecord(collection, record) {
  const local = await db[collection].get(record.id)
  if (local && !isNewer(record.updatedAt, local.updatedAt)) return
  applyingRemote = true
  try {
    await db[collection].put(record)
  } finally {
    applyingRemote = false
  }
}

async function applyRemoteDeletion(collection, id, deletedAt) {
  const local = await db[collection].get(id)
  if (!local) return
  const localAt = local.updatedAt || local.createdAt || ''
  if (deletedAt <= localAt) return
  applyingRemote = true
  try {
    await db[collection].delete(id)
  } finally {
    applyingRemote = false
  }
}

async function fetchFileBlob(meta) {
  const res = await apiFetch(`${API}/files/${meta.id}/blob`)
  if (!res.ok) throw new Error(`blob_fetch_failed:${res.status}`)
  const blob = await res.arrayBuffer()
  applyingRemote = true
  try {
    await db.files.put({
      id: meta.id,
      parentType: meta.parentType,
      parentId: meta.parentId,
      name: meta.name,
      mimeType: meta.mimeType,
      size: meta.size,
      updatedAt: meta.updatedAt,
      blob,
    })
  } finally {
    applyingRemote = false
  }
}

async function applyRemoteFileMeta(meta) {
  const local = await db.files.get(meta.id)
  const needsBlob = !local?.blob || isNewer(meta.updatedAt, local.updatedAt)
  if (local && !isNewer(meta.updatedAt, local.updatedAt) && local.blob) return

  if (!needsBlob) return

  if (local && !isNewer(meta.updatedAt, local.updatedAt)) return

  applyingRemote = true
  try {
    await db.files.put({
      ...meta,
      blob: local?.blob || null,
    })
  } finally {
    applyingRemote = false
  }

  fetchFileBlob(meta).catch(() => {})
}

async function applyPayload(payload) {
  for (const row of payload.records || []) {
    await applyRemoteRecord(row.collection, row.data)
  }
  for (const meta of payload.files || []) {
    await applyRemoteFileMeta(meta)
  }
  for (const tomb of payload.deletions || []) {
    if (tomb.collection === 'files') {
      await applyRemoteDeletion('files', tomb.id, tomb.deletedAt)
    } else {
      await applyRemoteDeletion(tomb.collection, tomb.id, tomb.deletedAt)
    }
  }
  if (payload.serverTime) lastSyncAt = payload.serverTime
}

export async function pullSnapshot() {
  const res = await apiFetch(`${API}/snapshot`)
  if (!res.ok) throw new Error(`snapshot_failed:${res.status}`)
  const payload = await res.json()
  await applyPayload(payload)
  return payload
}

async function pollChanges() {
  const url = lastSyncAt
    ? `${API}/changes?since=${encodeURIComponent(lastSyncAt)}`
    : `${API}/snapshot`
  const res = await apiFetch(url)
  if (!res.ok) throw new Error(`poll_failed:${res.status}`)
  const payload = await res.json()
  await applyPayload(payload)
}

async function flushPutRecord(collection, id) {
  const record = await db[collection].get(id)
  if (!record) return
  const res = await apiFetch(`${API}/records/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  })
  if (res.status === 409) return
  if (!res.ok) throw new Error(`put_record_failed:${res.status}`)
}

async function flushDeleteRecord(collection, id) {
  const res = await apiFetch(`${API}/records/${collection}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`delete_record_failed:${res.status}`)
}

async function flushPutFile(id) {
  const file = await db.files.get(id)
  if (!file?.blob) return
  const body = file.blob instanceof ArrayBuffer
    ? file.blob
    : await file.blob.arrayBuffer?.()
  if (!body) return

  const res = await apiFetch(`${API}/files/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'X-Parent-Type': file.parentType,
      'X-Parent-Id': file.parentId,
      'X-Name': file.name,
      'X-Mime-Type': file.mimeType || 'application/octet-stream',
      'X-Size': String(file.size ?? body.byteLength),
      'X-Updated-At': file.updatedAt,
    },
    body,
  })
  if (res.status === 409) return
  if (!res.ok) throw new Error(`put_file_failed:${res.status}`)
}

async function flushDeleteFile(id) {
  const res = await apiFetch(`${API}/files/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`delete_file_failed:${res.status}`)
}

export async function flushOutbox() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  const pending = await db.outbox.orderBy('seq').toArray()
  for (const item of pending) {
    if (item.collection === 'files') {
      if (item.op === 'put') await flushPutFile(item.id)
      else await flushDeleteFile(item.id)
    } else if (item.op === 'put') {
      await flushPutRecord(item.collection, item.id)
    } else {
      await flushDeleteRecord(item.collection, item.id)
    }
    await db.outbox.delete(item.seq)
  }
}

export async function syncPull() {
  registerHooks()
  try {
    setStatus('syncing')
    await pullSnapshot()
    setStatus('online')
  } catch (err) {
    setStatus('offline', err.message)
    throw err
  }
}

export async function syncStart(onStatus) {
  if (onStatus) statusCallback = onStatus
  registerHooks()
  try {
    setStatus('syncing')
    await flushOutbox()
    setStatus('online')
  } catch (err) {
    setStatus('offline', err.message)
  }

  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(async () => {
    try {
      await pollChanges()
      await flushOutbox()
      setStatus('online')
    } catch (err) {
      setStatus('offline', err.message)
    }
  }, POLL_MS)
}

export function syncStop() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = null
}

async function enqueueAllLocal() {
  await db.outbox.clear()
  const queuedAt = new Date().toISOString()
  for (const collection of SYNC_COLLECTIONS) {
    for (const row of await db[collection].toArray()) {
      await db.outbox.add({ op: 'put', collection, id: row.id, queuedAt })
    }
  }
  for (const f of await db.files.toArray()) {
    await db.outbox.add({ op: 'put', collection: 'files', id: f.id, queuedAt })
  }
}

/** Replace local data from export and push everything to the server. */
export async function importAllAndSync(data) {
  applyingRemote = true
  try {
    await importAll(data)
  } finally {
    applyingRemote = false
  }
  await enqueueAllLocal()
  await flushOutbox()
}

/** Test helper — reset sync module state */
export function _resetSyncForTests() {
  applyingRemote = false
  hooksRegistered = false
  pollTimer = null
  flushTimer = null
  lastSyncAt = ''
  statusCallback = () => {}
}

/** Test helper — expose applyingRemote guard */
export function _setApplyingRemote(value) {
  applyingRemote = value
}

export async function _enqueueForTest(op, collection, id) {
  return enqueue(op, collection, id)
}

export async function _applyPayloadForTest(payload) {
  return applyPayload(payload)
}

import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const RECORD_COLLECTIONS = new Set([
  'documents',
  'engagements',
  'partners',
  'teamMembers',
  'policies',
  'meetings',
  'buckets',
  'agreements',
  'activities',
])

export function openDb(dbPath) {
  mkdirSync(dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    );
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      parentType TEXT NOT NULL,
      parentId TEXT NOT NULL,
      name TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      updatedAt TEXT NOT NULL,
      blob BLOB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deletions (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      deletedAt TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    );
    CREATE INDEX IF NOT EXISTS idx_records_updatedAt ON records(updatedAt);
    CREATE INDEX IF NOT EXISTS idx_files_updatedAt ON files(updatedAt);
    CREATE INDEX IF NOT EXISTS idx_deletions_deletedAt ON deletions(deletedAt);
  `)
  return db
}

export function isRecordCollection(name) {
  return RECORD_COLLECTIONS.has(name)
}

export function nowIso() {
  return new Date().toISOString()
}

export function listSnapshot(db) {
  const records = db.prepare('SELECT collection, id, updatedAt, data FROM records').all()
    .map((row) => ({
      collection: row.collection,
      id: row.id,
      updatedAt: row.updatedAt,
      data: JSON.parse(row.data),
    }))

  const files = db.prepare(
    'SELECT id, parentType, parentId, name, mimeType, size, updatedAt FROM files'
  ).all()

  const deletions = db.prepare(
    'SELECT collection, id, deletedAt FROM deletions'
  ).all()

  return { serverTime: nowIso(), records, files, deletions }
}

export function listChanges(db, since) {
  const records = db.prepare(
    'SELECT collection, id, updatedAt, data FROM records WHERE updatedAt > ?'
  ).all(since).map((row) => ({
    collection: row.collection,
    id: row.id,
    updatedAt: row.updatedAt,
    data: JSON.parse(row.data),
  }))

  const files = db.prepare(
    'SELECT id, parentType, parentId, name, mimeType, size, updatedAt FROM files WHERE updatedAt > ?'
  ).all(since)

  const deletions = db.prepare(
    'SELECT collection, id, deletedAt FROM deletions WHERE deletedAt > ?'
  ).all(since)

  return { serverTime: nowIso(), records, files, deletions }
}

export function upsertRecord(db, collection, id, record) {
  if (!isRecordCollection(collection)) {
    throw new Error(`Unknown collection: ${collection}`)
  }
  const updatedAt = record.updatedAt || nowIso()
  const existing = db.prepare(
    'SELECT updatedAt FROM records WHERE collection = ? AND id = ?'
  ).get(collection, id)

  if (existing && existing.updatedAt > updatedAt) {
    return { ok: false, status: 409, reason: 'newer_exists' }
  }

  const data = JSON.stringify({ ...record, id, updatedAt })
  db.prepare(`
    INSERT INTO records (collection, id, updatedAt, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(collection, id) DO UPDATE SET
      updatedAt = excluded.updatedAt,
      data = excluded.data
  `).run(collection, id, updatedAt, data)

  db.prepare('DELETE FROM deletions WHERE collection = ? AND id = ?').run(collection, id)
  return { ok: true }
}

export function deleteRecord(db, collection, id) {
  if (!isRecordCollection(collection)) {
    throw new Error(`Unknown collection: ${collection}`)
  }
  const deletedAt = nowIso()
  db.prepare('DELETE FROM records WHERE collection = ? AND id = ?').run(collection, id)
  db.prepare(`
    INSERT INTO deletions (collection, id, deletedAt)
    VALUES (?, ?, ?)
    ON CONFLICT(collection, id) DO UPDATE SET deletedAt = excluded.deletedAt
  `).run(collection, id, deletedAt)
  return deletedAt
}

export function upsertFile(db, meta, blob) {
  const updatedAt = meta.updatedAt || nowIso()
  const existing = db.prepare('SELECT updatedAt FROM files WHERE id = ?').get(meta.id)

  if (existing && existing.updatedAt > updatedAt) {
    return { ok: false, status: 409, reason: 'newer_exists' }
  }

  db.prepare(`
    INSERT INTO files (id, parentType, parentId, name, mimeType, size, updatedAt, blob)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      parentType = excluded.parentType,
      parentId = excluded.parentId,
      name = excluded.name,
      mimeType = excluded.mimeType,
      size = excluded.size,
      updatedAt = excluded.updatedAt,
      blob = excluded.blob
  `).run(
    meta.id,
    meta.parentType,
    meta.parentId,
    meta.name,
    meta.mimeType,
    meta.size,
    updatedAt,
    blob
  )

  db.prepare('DELETE FROM deletions WHERE collection = ? AND id = ?').run('files', meta.id)
  return { ok: true }
}

export function deleteFile(db, id) {
  const deletedAt = nowIso()
  db.prepare('DELETE FROM files WHERE id = ?').run(id)
  db.prepare(`
    INSERT INTO deletions (collection, id, deletedAt)
    VALUES ('files', ?, ?)
    ON CONFLICT(collection, id) DO UPDATE SET deletedAt = excluded.deletedAt
  `).run(id, deletedAt)
  return deletedAt
}

export function getFileBlob(db, id) {
  return db.prepare('SELECT mimeType, name, blob FROM files WHERE id = ?').get(id)
}

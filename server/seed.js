import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { openDb, upsertRecord, upsertFile } from './db.js'

const COLLECTIONS = [
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

const defaultSeedPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'seed',
  'company-hub-2026-07-09.json'
)

export function loadExport(path = defaultSeedPath) {
  if (!existsSync(path)) {
    throw new Error(`Seed file not found: ${path}`)
  }
  const data = JSON.parse(readFileSync(path, 'utf8'))
  if (!data || (data.version !== 1 && data.version !== 2)) {
    throw new Error('Invalid export file: expected version 1 or 2')
  }
  return data
}

export function isDbEmpty(db) {
  const row = db.prepare('SELECT COUNT(*) AS n FROM records').get()
  const files = db.prepare('SELECT COUNT(*) AS n FROM files').get()
  return row.n === 0 && files.n === 0
}

/** Import a Company Hub JSON export into SQLite. */
export function importExport(db, data) {
  let records = 0
  let files = 0

  for (const collection of COLLECTIONS) {
    for (const record of data[collection] || []) {
      upsertRecord(db, collection, record.id, record)
      records += 1
    }
  }

  for (const f of data.files || []) {
    if (!f.dataBase64) continue
    const blob = Buffer.from(f.dataBase64, 'base64')
    upsertFile(db, {
      id: f.id,
      parentType: f.parentType,
      parentId: f.parentId,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      updatedAt: f.updatedAt,
    }, blob)
    files += 1
  }

  return { records, files }
}

export function seedDatabase(db, { path = defaultSeedPath, force = false } = {}) {
  if (!force && !isDbEmpty(db)) {
    return { skipped: true, records: 0, files: 0 }
  }

  if (force) {
    db.exec('DELETE FROM records; DELETE FROM files; DELETE FROM deletions;')
  }

  const data = loadExport(path)
  const counts = importExport(db, data)
  return { skipped: false, ...counts }
}

export function seedDbAtPath(dbPath, options = {}) {
  const db = openDb(dbPath)
  try {
    return seedDatabase(db, options)
  } finally {
    db.close()
  }
}

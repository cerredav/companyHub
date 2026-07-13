/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { openDb } from '../server/db.js'
import { seedDatabase, isDbEmpty } from '../server/seed.js'

let tmpDir
let dbPath

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'hub-seed-'))
  dbPath = join(tmpDir, 'test.sqlite')
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('server seed', () => {
  it('imports the bundled export into an empty database', () => {
    const db = openDb(dbPath)
    const result = seedDatabase(db)
    expect(result.skipped).toBe(false)
    expect(result.records).toBeGreaterThan(200)
    expect(result.files).toBeGreaterThan(0)
    expect(isDbEmpty(db)).toBe(false)
    db.close()
  })

  it('skips when data already exists unless forced', () => {
    const db = openDb(dbPath)
    seedDatabase(db)
    const second = seedDatabase(db)
    expect(second.skipped).toBe(true)

    const forced = seedDatabase(db, { force: true })
    expect(forced.skipped).toBe(false)
    db.close()
  })
})

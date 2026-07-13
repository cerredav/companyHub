#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { seedDbAtPath } from '../server/seed.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = process.env.HUB_DB_PATH || join(root, 'server', 'data', 'hub.sqlite')
const seedPath = process.env.HUB_SEED_PATH
const force = process.argv.includes('--force')

const result = seedDbAtPath(dbPath, { path: seedPath, force })

if (result.skipped) {
  console.log('[seed] database already has data — use --force to replace')
} else {
  console.log(`[seed] imported ${result.records} records and ${result.files} files into ${dbPath}`)
}

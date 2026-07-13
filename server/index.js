import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { seedDatabase } from './seed.js'

const port = Number(process.env.PORT || 3001)
const defaultDbPath = join(dirname(fileURLToPath(import.meta.url)), 'data', 'hub.sqlite')
const dbPath = process.env.SQLITE_PATH || defaultDbPath

mkdirSync(dirname(dbPath), { recursive: true })

const app = createApp({ dbPath })

const seedResult = seedDatabase(app._db)
if (!seedResult.skipped) {
  console.log(`[company-hub] seeded ${seedResult.records} records, ${seedResult.files} files`)
}

const server = app.listen(port, () => {
  console.log(`[company-hub] API listening on http://localhost:${port}`)
  console.log(`[company-hub] sqlite=${dbPath}`)
})

function shutdown() {
  server.close()
  app._closeDb?.()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

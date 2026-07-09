import { createApp } from './app.js'

const port = Number(process.env.PORT || 3001)
const app = createApp()
const server = app.listen(port, () => {
  console.log(`[company-hub] API listening on http://localhost:${port}`)
})

function shutdown() {
  server.close()
  app._closeDb?.()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

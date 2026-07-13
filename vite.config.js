import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub project site: https://cerredav.github.io/companyHub/
// Browser Origin for CORS is https://cerredav.github.io (path is not part of Origin)
const pagesBase = process.env.GITHUB_PAGES ? '/companyHub/' : '/'

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
})

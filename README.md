# Company Hub

Local-first internal site for consolidating Larx company knowledge: strategy, engagements (pilots), teams, partners, process documents, and file attachments.

## Deploy (client + API)

GitHub Pages hosts the **static client**. Render hosts the **Express + SQLite API**. Pages cannot run Node.

| Piece | Host | URL |
|---|---|---|
| React client | GitHub Pages | https://cerredav.github.io/companyHub/ |
| API | Render | https://company-hub-api.onrender.com (after Blueprint) |

### 1. Deploy the API (Render)

1. Open [Render Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance** → select `cerredav/companyHub`.
2. Apply `render.yaml` (Docker web service + 1 GB disk on **Starter** plan — free tier cannot keep SQLite across restarts).
3. After deploy, confirm health: `https://<your-service>.onrender.com/api/health` → `{ "ok": true }`.

CORS is already set for `https://cerredav.github.io` and local Vite.

### 2. Deploy the client (GitHub Pages)

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Repo **Settings → Secrets and variables → Actions** → add secret:
   - Name: `VITE_API_URL`
   - Value: `https://<your-service>.onrender.com/api`
3. Push to `main` (or re-run **Deploy to GitHub Pages**). Workflow builds with `base=/companyHub/` and that API URL.

Local rebuild check:

```bash
GITHUB_PAGES=true VITE_API_URL=https://company-hub-api.onrender.com/api npm run build
```

Without `VITE_API_URL`, the live site still works offline (IndexedDB only; sync status shows offline).

## Quick start

```bash
npm install
npm run dev          # client (port 5173)
npm run server       # API (port 3001) — team sync
```

Open the URL shown (usually `http://localhost:5173`). Default shared password: **`company`**.

Without the server, the app still works: data lives in the browser (IndexedDB) and seeds on first visit.

## Sections

| Sidebar item | What it holds |
|---|---|
| **Home** | Company purpose & offices, curated quick links, dashboard counts, export/import |
| **Strategy** | Five strategy pillars with deck links (from infonet) |
| **Engagements** | Pilots/contracts with POC, POC contact, supporting documents |
| **Teams** | Team roster; click a team card for members, engagements, and sections (notes, documents, links per topic) |
| **Team Meetings** | Meeting summaries pasted from Granola notes, newest first |
| **Policies** | Company-wide policies (handbook, travel, holidays, etc.) |
| **Processes** | Living process docs + downloadable attachments |

## Seed data

First-run seed comes from [`src/seed.js`](src/seed.js), populated from downloaded infonet page sources. Existing installs get a one-shot top-up (`seedNewContent`) for policies, home cards, and strategy (only if strategy was never edited).

Server SQLite seed: `npm run seed` (or `--force`) loads `server/seed/company-hub-2026-07-09.json`. Empty DBs auto-seed on API startup.

To reset client data: clear site data in browser devtools (IndexedDB + localStorage), or import a fresh export.

## File attachments

Upload any file to engagements (Supporting Documents) or processes (Process Documents). Files are stored as blobs in IndexedDB via `src/db.js`. Download from the UI; included in JSON export (v2, base64-encoded).

No upload size cap — large files increase export size.

## Theming

Dark (larx) is default. Toggle **Light mode** / **Dark mode** in the sidebar footer. Preference persists in localStorage.

Styling uses larx design tokens ported from `orion-js-client/styles` (Space Mono, larx blue palette, glassy surfaces).

## Architecture

```
server/            ← Express + SQLite sync API
src/lib/sync.js    ← client outbox + LWW pull
src/db.js          ← Dexie IndexedDB
src/seed.js        ← client seed content
src/App.jsx        ← password gate, sidebar, theme, hash router
src/pages/         ← one file per section
```

## Scripts

```bash
npm run dev      # Vite client
npm run server   # API with --watch
npm start        # API (production)
npm run seed     # import server/seed JSON into SQLite
npm run build    # production client → dist/
npm test         # vitest
```

## Limits (MVP)

- Shared password is a UI gate, not real security (API has no auth yet).
- Render free web services lose disk on restart — use Starter + disk for shared sync.
- No edit history or per-user attribution yet.

# Company Hub

Local-first internal site for consolidating company knowledge: strategy, engagements (pilots), teams, partners, and process documents.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`). Default shared password: **`company`**.

## Sections

| Sidebar item | What it holds |
|---|---|
| **Home** | Dashboard counts, recent updates, JSON export/import |
| **Strategy** | Single editable markdown doc for company direction |
| **Engagements** | Pilots/contracts table + Partners & Data Providers tab |
| **Teams** | Team members with roles, grouped by team |
| **Processes** | Multiple living process docs (replaces scattered Drive files) |

Everything is editable in the UI. No code changes needed to add rows or docs.

## Data storage

All data lives in the browser's **IndexedDB** (via Dexie). It persists across sessions on the same browser/profile.

**Sharing between teammates:** use **Export JSON** on Home, send the file, teammate uses **Import JSON** (replaces their local copy).

**Backup:** export regularly. IndexedDB can be cleared by browser maintenance or profile resets.

## Architecture

```
src/db.js          ← single storage seam (swap for API calls later)
src/App.jsx        ← password gate + sidebar + hash router
src/pages/         ← one file per section
src/components/    ← EditableTable, MarkdownDoc (shared)
```

When you're ready for a backend, replace `src/db.js` with fetch calls to your API. Pages and components stay the same.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview production build
npm test         # vitest (CRUD + export/import)
```

## Limits (MVP)

- Data is per-browser — export/import is the sharing mechanism until a backend exists.
- Shared password is a UI gate, not real security (data is client-side).
- No edit history or per-user attribution — deferred to backend phase.

## Password

The shared password is set in `src/App.jsx` (`SHARED_PASSWORD`). Change it there for your team.

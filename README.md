# Company Hub

Local-first internal site for consolidating Larx company knowledge: strategy, engagements (pilots), teams, partners, process documents, and file attachments.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`). Default shared password: **`company`**.

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

To reset and re-seed: clear site data in browser devtools (IndexedDB + localStorage), or import a fresh export.

## File attachments

Upload any file to engagements (Supporting Documents) or processes (Process Documents). Files are stored as blobs in IndexedDB via `src/db.js`. Download from the UI; included in JSON export (v2, base64-encoded).

No upload size cap — large files increase export size.

## Theming

Dark (larx) is default. Toggle **Light mode** / **Dark mode** in the sidebar footer. Preference persists in localStorage.

Styling uses larx design tokens ported from `orion-js-client/styles` (Space Mono, larx blue palette, glassy surfaces).

## Architecture

```
src/db.js          ← single storage seam (swap for API calls later)
src/seed.js        ← infonet / pipeline seed content
src/tokens.css     ← larx design tokens (dark + light)
src/App.jsx        ← password gate, sidebar, theme toggle, hash router
src/pages/         ← one file per section
src/components/    ← EditableTable, MarkdownDoc, AttachmentList
```

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build → dist/
npm test         # vitest (CRUD, files, export/import v2)
```

## Limits (MVP)

- Data is per-browser — export/import is the sharing mechanism until a backend exists.
- Shared password is a UI gate, not real security.
- No edit history or per-user attribution — deferred to backend phase.

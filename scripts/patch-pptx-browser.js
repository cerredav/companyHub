#!/usr/bin/env node
/**
 * pptx-browser 4.1.5 uses `defRPr` before its `const` declaration inside
 * renderTextBody's paragraph loop. That throws a TDZ ReferenceError on every
 * paragraph with <a:pPr>, which the shape renderer catches — so slides draw
 * backgrounds/images but no text. Reorder the declarations after each install.
 */
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'node_modules/pptx-browser/src/render.js')
const viteCache = join(root, 'node_modules/.vite')

function clearViteCache() {
  if (!existsSync(viteCache)) return
  rmSync(viteCache, { recursive: true, force: true })
  console.log('[patch-pptx-browser] cleared node_modules/.vite cache')
}

if (!existsSync(target)) {
  console.warn('[patch-pptx-browser] pptx-browser not installed — skip')
  process.exit(0)
}

const broken = `    // ── Bullet / list marker ─────────────────────────────────────────────────
    const bullet = pPr ? parseBullet(pPr, defRPr, themeColors, themeData) : null;

    // Spacing
    const spcBef = g1(pPr, 'spcBef');
    const spcAft = g1(pPr, 'spcAft');
    const lnSpc = g1(pPr, 'lnSpc');
    const defRPr = g1(pPr, 'defRPr');`

const fixed = `    // Spacing
    const spcBef = g1(pPr, 'spcBef');
    const spcAft = g1(pPr, 'spcAft');
    const lnSpc = g1(pPr, 'lnSpc');
    const defRPr = g1(pPr, 'defRPr');

    // ── Bullet / list marker ─────────────────────────────────────────────────
    // ponytail: defRPr must be declared before parseBullet (upstream TDZ bug)
    const bullet = pPr ? parseBullet(pPr, defRPr, themeColors, themeData) : null;`

const src = readFileSync(target, 'utf8')

if (src.includes(fixed) || src.includes('defRPr must be declared before parseBullet')) {
  console.log('[patch-pptx-browser] already applied')
  clearViteCache()
  process.exit(0)
}

if (!src.includes(broken)) {
  console.warn('[patch-pptx-browser] expected snippet not found — package may have changed')
  clearViteCache()
  process.exit(0)
}

writeFileSync(target, src.replace(broken, fixed))
console.log('[patch-pptx-browser] fixed renderTextBody TDZ bug')
clearViteCache()

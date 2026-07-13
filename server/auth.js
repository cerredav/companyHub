import { createHmac, timingSafeEqual } from 'node:crypto'

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromB64url(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

export function defaultTokenSecret() {
  // Shared with client (VITE_HUB_TOKEN_SECRET); must match for local + Pages builds
  return process.env.HUB_TOKEN_SECRET || 'dev-hub-secret'
}

export function secretsMatch(provided, expected) {
  return passwordsMatch(provided, expected)
}

/** Parse `Authorization: Bearer <apiSecret> [sessionToken]` */
export function parseBearerAuthorization(header) {
  const match = /^Bearer\s+(\S+)(?:\s+(\S+))?$/i.exec(String(header || '').trim())
  if (!match) return null
  return { apiSecret: match[1], sessionToken: match[2] || null }
}

export function defaultPassword() {
  return process.env.HUB_PASSWORD || 'company'
}

/** Issue HMAC-signed token: base64url({exp}) + "." + hmac */
export function issueToken(secret, now = Date.now()) {
  const expiresAt = new Date(now + TOKEN_TTL_MS).toISOString()
  const payload = b64url(JSON.stringify({ exp: expiresAt }))
  const sig = createHmac('sha256', secret).update(payload).digest()
  return { token: `${payload}.${b64url(sig)}`, expiresAt }
}

export function verifyToken(token, secret, now = Date.now()) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const expected = createHmac('sha256', secret).update(payload).digest()
  let actual
  try {
    actual = fromB64url(sig)
  } catch {
    return false
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  try {
    const { exp } = JSON.parse(fromB64url(payload).toString('utf8'))
    if (!exp || Date.parse(exp) <= now) return false
    return true
  } catch {
    return false
  }
}

/** Constant-time password compare (pads lengths so leaks stay small). */
export function passwordsMatch(provided, expected) {
  const a = Buffer.from(String(provided ?? ''), 'utf8')
  const b = Buffer.from(String(expected ?? ''), 'utf8')
  const len = Math.max(a.length, b.length, 1)
  const pa = Buffer.alloc(len)
  const pb = Buffer.alloc(len)
  a.copy(pa)
  b.copy(pb)
  return a.length === b.length && timingSafeEqual(pa, pb)
}

const AUTH_KEY = 'companyHubAuth'
const LEGACY_UNLOCK_KEY = 'companyHubUnlocked'
export const AUTH_EXPIRED_EVENT = 'hub:auth-expired'

/** Normalize so both `https://host/api` and `https://host/api/` work. */
function apiRoot() {
  const raw = String(import.meta.env.VITE_API_URL || '/api').trim()
  return raw.replace(/\/+$/, '') || '/api'
}

const API = apiRoot()
// Must match server HUB_TOKEN_SECRET
const HUB_TOKEN_SECRET = import.meta.env.VITE_HUB_TOKEN_SECRET || 'dev-hub-secret'

export function clearLegacyUnlock() {
  localStorage.removeItem(LEGACY_UNLOCK_KEY)
}

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.expiresAt) return null
    return parsed
  } catch {
    return null
  }
}

export function isAuthenticated(now = Date.now()) {
  const auth = getAuth()
  if (!auth) return false
  return Date.parse(auth.expiresAt) > now
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}

export function notifyAuthExpired() {
  logout()
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}

/** Authorization: Bearer <HUB_TOKEN_SECRET> [sessionToken] */
export function authHeaders({ includeSession = true } = {}) {
  const auth = includeSession && isAuthenticated() ? getAuth() : null
  if (auth?.token) {
    return { Authorization: `Bearer ${HUB_TOKEN_SECRET} ${auth.token}` }
  }
  return { Authorization: `Bearer ${HUB_TOKEN_SECRET}` }
}

/**
 * POST …/auth/login — stores session token on success.
 * Throws { code: 'invalid_password' | 'unreachable' | 'bad_response' | 'unauthorized', message }
 */
export async function login(password) {
  // Relative /api on GitHub Pages hits Pages itself → 404, not the Render API
  if (
    typeof location !== 'undefined'
    && location.hostname.endsWith('github.io')
    && API.startsWith('/')
  ) {
    const err = new Error('API URL not configured — set VITE_API_URL for Pages builds')
    err.code = 'bad_response'
    throw err
  }

  let res
  try {
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders({ includeSession: false }),
      },
      body: JSON.stringify({ password }),
    })
  } catch {
    const err = new Error('Cannot reach server — try again later')
    err.code = 'unreachable'
    throw err
  }

  if (res.status === 401) {
    let body = null
    try { body = await res.json() } catch { /* ignore */ }
    if (body?.error === 'invalid_password') {
      const err = new Error('Incorrect password')
      err.code = 'invalid_password'
      throw err
    }
    const err = new Error('Unauthorized — check API token configuration')
    err.code = 'unauthorized'
    throw err
  }

  if (res.status === 404) {
    const err = new Error(`Login endpoint not found (${API}/auth/login)`)
    err.code = 'bad_response'
    throw err
  }

  if (!res.ok) {
    const err = new Error('Login failed — try again later')
    err.code = 'bad_response'
    throw err
  }

  const body = await res.json()
  if (!body?.token || !body?.expiresAt) {
    const err = new Error('Login failed — try again later')
    err.code = 'bad_response'
    throw err
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify({
    token: body.token,
    expiresAt: body.expiresAt,
  }))
  return body
}

/** Test helper */
export function _setAuthForTest(auth) {
  if (!auth) localStorage.removeItem(AUTH_KEY)
  else localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

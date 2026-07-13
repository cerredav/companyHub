import { useEffect, useState } from 'react'
import { seedIfEmpty, seedNewContent, migratePartnerLinks, migrateAgreementDashboardLinks } from './db'
import {
  AUTH_EXPIRED_EVENT,
  clearLegacyUnlock,
  isAuthenticated,
  login,
} from './lib/auth'
import Home from './pages/Home'
import Strategy from './pages/Strategy'
import Engagements from './pages/Engagements'
import Teams from './pages/Teams'
import Policies from './pages/Policies'
import Meetings from './pages/Meetings'
import Processes from './pages/Processes'
import './styles.css'

const THEME_KEY = 'companyHubTheme'

const NAV = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'strategy', label: 'Strategy', icon: '◎' },
  { id: 'engagements', label: 'Engagements', icon: '◈' },
  { id: 'teams', label: 'Teams', icon: '◉' },
  { id: 'meetings', label: 'Team Meetings', icon: '◫' },
  { id: 'policies', label: 'Policies', icon: '§' },
  { id: 'processes', label: 'Processes', icon: '▤' },
]

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(password)
      onUnlock()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <h1>Company Hub</h1>
        <p>Enter the shared password to continue.</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('') }}
          autoFocus
          disabled={busy}
        />
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}

function parseHash(hash) {
  const path = hash.slice(1) || 'home'
  const [base, ...params] = path.split('/')
  return { base, params }
}

function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return route
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => isAuthenticated())
  const [ready, setReady] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ state: 'syncing', detail: '' })
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const { base: routeBase, params } = useHashRoute()

  useEffect(() => {
    clearLegacyUnlock()
  }, [])

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const onExpired = () => {
      setUnlocked(false)
      setReady(false)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  useEffect(() => {
    if (!unlocked) return undefined
    let cancelled = false
    import('./lib/sync.js').then(({ syncPull, syncStart, syncStop }) => {
      if (cancelled) return
      syncPull()
        .catch(() => {})
        .then(() => seedIfEmpty())
        .then(() => seedNewContent())
        .then(() => migratePartnerLinks())
        .then(() => migrateAgreementDashboardLinks())
        .then(() => {
          if (cancelled) {
            syncStop()
            return
          }
          syncStart(setSyncStatus)
          setReady(true)
        })
    })
    return () => {
      cancelled = true
      import('./lib/sync.js').then(({ syncStop }) => syncStop())
    }
  }, [unlocked])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  if (!ready) {
    return <div className="loading">Loading…</div>
  }

  const teamName = routeBase === 'teams' && params[0]
    ? decodeURIComponent(params[0])
    : null
  const meetingId = routeBase === 'meetings' && params[0]
    ? decodeURIComponent(params[0])
    : null
  const engagementTab = routeBase === 'engagements' && params[0]
    ? decodeURIComponent(params[0])
    : null
  const policyId = routeBase === 'policies' && params[0]
    ? decodeURIComponent(params[0])
    : null

  let page
  switch (routeBase) {
    case 'home': page = <Home />; break
    case 'strategy': page = <Strategy />; break
    case 'engagements': page = <Engagements tab={engagementTab} />; break
    case 'teams': page = <Teams teamName={teamName} />; break
    case 'meetings': page = <Meetings meetingId={meetingId} />; break
    case 'policies': page = <Policies policyId={policyId} />; break
    case 'processes': page = <Processes />; break
    default: page = <Home />
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="sidebar-brand-icon" aria-hidden />
          Larx Hub
        </div>
        <nav>
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${routeBase === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p
            className={`sync-status sync-status--${syncStatus.state}`}
            title={syncStatus.detail || undefined}
          >
            {syncStatus.state === 'online' && '● Synced'}
            {syncStatus.state === 'syncing' && '◌ Syncing…'}
            {syncStatus.state === 'offline' && '○ Offline — local only'}
          </p>
          <button className="btn theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
        </div>
      </aside>
      <main className="main">
        {page}
      </main>
    </div>
  )
}

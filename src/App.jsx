import { useEffect, useState } from 'react'
import { seedIfEmpty } from './db'
import Home from './pages/Home'
import Strategy from './pages/Strategy'
import Engagements from './pages/Engagements'
import Teams from './pages/Teams'
import Processes from './pages/Processes'
import './styles.css'

// ponytail: cosmetic gate only — not security; data is client-side
const SHARED_PASSWORD = 'company'
const UNLOCK_KEY = 'companyHubUnlocked'
const THEME_KEY = 'companyHubTheme'

const NAV = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'strategy', label: 'Strategy', icon: '◎' },
  { id: 'engagements', label: 'Engagements', icon: '◈' },
  { id: 'teams', label: 'Teams', icon: '◉' },
  { id: 'processes', label: 'Processes', icon: '▤' },
]

const PAGES = {
  home: Home,
  strategy: Strategy,
  engagements: Engagements,
  teams: Teams,
  processes: Processes,
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (password === SHARED_PASSWORD) {
      localStorage.setItem(UNLOCK_KEY, '1')
      onUnlock()
    } else {
      setError('Incorrect password')
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
        />
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">Enter</button>
      </form>
    </div>
  )
}

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home')

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return route
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(UNLOCK_KEY) === '1')
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const route = useHashRoute()

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true))
  }, [])

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  if (!ready) {
    return <div className="loading">Loading…</div>
  }

  const Page = PAGES[route] ?? Home

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">Larx Hub</div>
        <nav>
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${route === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
          </button>
        </div>
      </aside>
      <main className="main">
        <Page />
      </main>
    </div>
  )
}

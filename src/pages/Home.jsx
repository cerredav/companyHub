import { useLiveQuery } from 'dexie-react-hooks'
import MarkdownDoc from '../components/MarkdownDoc'
import { getCounts, getRecentUpdates, exportAll, importAll, getDocumentBySlug, saveDocument } from '../db'

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `company-hub-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Home() {
  const counts = useLiveQuery(getCounts) ?? {}
  const recent = useLiveQuery(() => getRecentUpdates(8)) ?? []
  const companyInfo = useLiveQuery(() => getDocumentBySlug('company-info'))
  const quickLinks = useLiveQuery(() => getDocumentBySlug('quick-links'))

  const handleExport = async () => {
    const data = await exportAll()
    downloadJson(data)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!confirm('Import will replace all local data. Continue?')) return
        await importAll(data)
      } catch (err) {
        alert(`Import failed: ${err.message}`)
      }
    }
    input.click()
  }

  return (
    <div className="page home">
      <h1>Home</h1>
      <p className="subtitle">Larx team dashboard — strategy, engagements, teams, and processes in one place.</p>

      <div className="home-cards">
        {companyInfo && (
          <MarkdownDoc
            compact
            title={companyInfo.title}
            body={companyInfo.body}
            onSave={(body) => saveDocument({ ...companyInfo, body })}
          />
        )}
        {quickLinks && (
          <MarkdownDoc
            compact
            title={quickLinks.title}
            body={quickLinks.body}
            onSave={(body) => saveDocument({ ...quickLinks, body })}
          />
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{counts.engagements ?? '—'}</span>
          <span className="stat-label">Engagements</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.teamMembers ?? '—'}</span>
          <span className="stat-label">Team Members</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.policies ?? '—'}</span>
          <span className="stat-label">Policies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{counts.processDocs ?? '—'}</span>
          <span className="stat-label">Process Docs</span>
        </div>
      </div>

      <div className="home-grid">
        <section>
          <h2>Recently Updated</h2>
          {recent.length === 0 ? (
            <p className="muted">No updates yet.</p>
          ) : (
            <ul className="recent-list">
              {recent.map((item) => (
                <li key={`${item.section}-${item.id}`}>
                  <span className="recent-label">{item.label}</span>
                  <span className="recent-meta">
                    {item.section} · {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Backup &amp; Share</h2>
          <p className="muted">
            Data lives in this browser. Export to share with teammates or back up; import to restore.
          </p>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleExport}>Export JSON</button>
            <button className="btn" onClick={handleImport}>Import JSON</button>
          </div>
        </section>
      </div>
    </div>
  )
}

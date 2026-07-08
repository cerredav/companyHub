import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import MarkdownDoc from '../components/MarkdownDoc'
import AttachmentList from '../components/AttachmentList'
import { listProcessDocuments, saveDocument, deleteDocument } from '../db'

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function Processes() {
  const docs = useLiveQuery(listProcessDocuments) ?? []
  const [activeId, setActiveId] = useState(null)
  const [newTitle, setNewTitle] = useState('')

  const active = docs.find((d) => d.id === activeId)

  const handleCreate = async (e) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    const slug = slugify(title)
    const doc = await saveDocument({
      slug,
      title,
      body: `# ${title}\n\nDescribe the process here.\n`,
    })
    setNewTitle('')
    setActiveId(doc.id)
  }

  const handleDelete = async () => {
    if (!active || !confirm(`Delete "${active.title}"?`)) return
    await deleteDocument(active.id)
    setActiveId(null)
  }

  return (
    <div className="page processes">
      <h1>Processes</h1>
      <p className="subtitle">Living process docs with downloadable attachments.</p>

      <div className="process-layout">
        <aside className="process-list">
          <form className="new-doc-form" onSubmit={handleCreate}>
            <input
              placeholder="New process title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">Add</button>
          </form>
          <ul>
            {docs.map((d) => (
              <li key={d.id}>
                <button
                  className={`process-link ${activeId === d.id ? 'active' : ''}`}
                  onClick={() => setActiveId(d.id)}
                >
                  {d.title}
                </button>
              </li>
            ))}
            {docs.length === 0 && <li className="muted">No process docs yet.</li>}
          </ul>
        </aside>

        <div className="process-content">
          {active ? (
            <>
              <MarkdownDoc
                title={active.title}
                body={active.body}
                onSave={(body) => saveDocument({ ...active, body })}
                onDelete={handleDelete}
              />
              <AttachmentList
                parentType="process"
                parentId={active.id}
                title="Process Documents"
              />
            </>
          ) : (
            <p className="muted">Select a process or create a new one.</p>
          )}
        </div>
      </div>
    </div>
  )
}

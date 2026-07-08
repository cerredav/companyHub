import { useState, useEffect } from 'react'
import { marked } from 'marked'

export default function MarkdownDoc({ title, body, onSave, onDelete, compact = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(body)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(body)
  }, [body, editing])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(body)
    setEditing(false)
  }

  return (
    <div className={`markdown-doc${compact ? ' markdown-doc--compact' : ''}`}>
      <div className="page-header">
        {compact ? <h2>{title}</h2> : <h1>{title}</h1>}
        <div className="btn-group">
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button className="btn" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className={`btn ${compact ? 'btn-sm' : 'btn-primary'}`} onClick={() => setEditing(true)}>Edit</button>
          )}
          {onDelete && !editing && (
            <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          )}
        </div>
      </div>

      {editing ? (
        <textarea
          className="markdown-editor"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={compact ? 12 : 24}
        />
      ) : (
        <div
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: marked.parse(body || '_No content yet._') }}
        />
      )}
    </div>
  )
}

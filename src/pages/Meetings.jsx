import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { marked } from 'marked'
import { listMeetings, saveMeeting, deleteMeeting } from '../db'

const today = () => new Date().toISOString().slice(0, 10)

function MeetingDetail({ meeting, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const startEdit = () => {
    setDraft({ ...meeting })
    setEditing(true)
  }

  const save = async () => {
    await saveMeeting(draft)
    setEditing(false)
    setDraft(null)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(null)
  }

  if (editing) {
    return (
      <div className="meeting-detail">
        <div className="meeting-edit-form">
          <input
            placeholder="Meeting title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <div className="meeting-edit-row">
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
            <input
              placeholder="Attendees"
              value={draft.attendees}
              onChange={(e) => setDraft({ ...draft, attendees: e.target.value })}
            />
          </div>
          <input
            placeholder="Granola link (optional)"
            value={draft.link}
            onChange={(e) => setDraft({ ...draft, link: e.target.value })}
          />
          <textarea
            className="markdown-editor"
            placeholder="Paste the Granola summary here (markdown)…"
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            rows={18}
          />
          <div className="btn-group">
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn" onClick={cancel}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="meeting-detail">
      <div className="page-header">
        <div>
          <h2>{meeting.title}</h2>
          <p className="meeting-meta">
            {new Date(meeting.date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            })}
            {meeting.attendees && <> · {meeting.attendees}</>}
            {meeting.link && (
              <>
                {' · '}
                <a href={meeting.link} target="_blank" rel="noopener noreferrer">Granola transcript</a>
              </>
            )}
          </p>
        </div>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={startEdit}>Edit</button>
          <button className="btn btn-danger" onClick={() => onDelete(meeting)}>Delete</button>
        </div>
      </div>
      <div
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: marked.parse(meeting.summary || '_No summary yet._') }}
      />
    </div>
  )
}

export default function Meetings() {
  const meetings = useLiveQuery(listMeetings) ?? []
  const [activeId, setActiveId] = useState(null)
  const [newTitle, setNewTitle] = useState('')

  const active = meetings.find((m) => m.id === activeId) ?? meetings[0]

  const handleCreate = async (e) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    const meeting = await saveMeeting({
      title,
      date: today(),
      attendees: '',
      link: '',
      summary: '',
    })
    setNewTitle('')
    setActiveId(meeting.id)
  }

  const handleDelete = async (meeting) => {
    if (!confirm(`Delete "${meeting.title}"?`)) return
    await deleteMeeting(meeting.id)
    setActiveId(null)
  }

  return (
    <div className="page meetings">
      <h1>Team Meetings</h1>
      <p className="subtitle">Meeting summaries from Granola notes — newest first.</p>

      <div className="process-layout">
        <aside className="process-list">
          <form className="new-doc-form" onSubmit={handleCreate}>
            <input
              placeholder="New meeting title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">Add</button>
          </form>
          <ul>
            {meetings.map((m) => (
              <li key={m.id}>
                <button
                  className={`process-link ${active?.id === m.id ? 'active' : ''}`}
                  onClick={() => setActiveId(m.id)}
                >
                  <span className="meeting-list-title">{m.title}</span>
                  <span className="meeting-list-date">{m.date}</span>
                </button>
              </li>
            ))}
            {meetings.length === 0 && <li className="muted">No meetings yet.</li>}
          </ul>
        </aside>

        <div className="process-content">
          {active ? (
            <MeetingDetail meeting={active} onDelete={handleDelete} />
          ) : (
            <p className="muted">Add a meeting to get started.</p>
          )}
        </div>
      </div>
    </div>
  )
}

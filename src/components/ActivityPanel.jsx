import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  listActivities,
  addActivity,
  saveActivity,
  deleteActivity,
  listTeamMembers,
  listMeetings,
  listMeetingsFor,
  linkMeeting,
  unlinkMeeting,
} from '../db'

import TimeStrip, { KIND_CLASS } from './TimeStrip'

const toLocalDatetimeValue = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalDatetimeValue = (value) => new Date(value).toISOString()

function meetingToTimelineItem(meeting) {
  return {
    id: `meeting-${meeting.id}`,
    meetingId: meeting.id,
    kind: 'meeting',
    createdAt: `${meeting.date}T12:00:00.000Z`,
    text: meeting.title,
    author: '',
  }
}

function NoteEditor({ activity, members, onSave, onCancel }) {
  const [text, setText] = useState(activity.text)
  const [author, setAuthor] = useState(activity.author || '')
  const [when, setWhen] = useState(() => toLocalDatetimeValue(activity.createdAt))

  const handleSave = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !when) return
    await onSave({
      id: activity.id,
      text: trimmed,
      author: author.trim(),
      createdAt: fromLocalDatetimeValue(when),
    })
  }

  return (
    <form className="activity-edit-form" onSubmit={handleSave}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <div className="activity-edit-row">
        <input
          type="datetime-local"
          className="activity-when"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        />
        <select value={author} onChange={(e) => setAuthor(e.target.value)}>
          <option value="">Author (optional)</option>
          {members.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" type="submit">Save</button>
        <button className="btn btn-sm" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function ActivityPanel({ parentType, parentId }) {
  const activities = useLiveQuery(
    () => listActivities(parentType, parentId),
    [parentType, parentId]
  ) ?? []
  const linkedMeetings = useLiveQuery(
    () => listMeetingsFor(parentType, parentId),
    [parentType, parentId]
  ) ?? []
  const allMeetings = useLiveQuery(listMeetings) ?? []
  const members = useLiveQuery(listTeamMembers) ?? []
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [when, setWhen] = useState(() => toLocalDatetimeValue())
  const [editingId, setEditingId] = useState(null)

  const timeline = useMemo(() => {
    const meetingItems = linkedMeetings.map(meetingToTimelineItem)
    const merged = [...activities, ...meetingItems]
    return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [activities, linkedMeetings])

  const linkableMeetings = allMeetings.filter((m) => {
    const key = parentType === 'engagement' ? 'engagementIds' : 'partnerIds'
    return !(m[key] ?? []).includes(parentId)
  })

  const handleAdd = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !when) return
    await addActivity({
      parentType,
      parentId,
      kind: 'note',
      text: trimmed,
      author: author.trim(),
      createdAt: fromLocalDatetimeValue(when),
    })
    setText('')
    setWhen(toLocalDatetimeValue())
  }

  const handleSave = async (data) => {
    await saveActivity(data)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this update?')) {
      await deleteActivity(id)
      if (editingId === id) setEditingId(null)
    }
  }

  const handleLinkMeeting = async (meetingId) => {
    if (!meetingId) return
    await linkMeeting(meetingId, parentType, parentId)
  }

  const handleUnlinkMeeting = async (meetingId) => {
    if (confirm('Unlink this meeting from this record?')) {
      await unlinkMeeting(meetingId, parentType, parentId)
    }
  }

  return (
    <div className="activity-panel">
      <div className="activity-panel-head">
        <h3>Updates &amp; Activity</h3>
        {linkableMeetings.length > 0 && (
          <select
            className="activity-link-meeting"
            value=""
            onChange={(e) => handleLinkMeeting(e.target.value)}
          >
            <option value="">Link meeting…</option>
            {linkableMeetings.map((m) => (
              <option key={m.id} value={m.id}>{m.title} ({m.date})</option>
            ))}
          </select>
        )}
      </div>

      <form className="activity-add-form" onSubmit={handleAdd}>
        <input
          placeholder="Add an update…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="datetime-local"
          className="activity-when"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          title="When did this happen?"
        />
        <select value={author} onChange={(e) => setAuthor(e.target.value)}>
          <option value="">Author (optional)</option>
          {members.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" type="submit">Add</button>
      </form>

      <TimeStrip items={timeline} />

      {timeline.length === 0 ? (
        <p className="muted">No activity yet — edits, uploads, meetings, and notes appear here.</p>
      ) : (
        <ul className="activity-feed">
          {timeline.map((a) => (
            <li key={a.id} className="activity-item">
              {editingId === a.id && a.kind === 'note' ? (
                <NoteEditor
                  activity={a}
                  members={members}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="activity-item-head">
                    <span className={`badge activity-badge ${KIND_CLASS[a.kind] || ''}`}>
                      {a.kind}
                    </span>
                    <time className="activity-date">
                      {new Date(a.createdAt).toLocaleString()}
                    </time>
                    {a.author && <span className="activity-author">{a.author}</span>}
                    {a.kind === 'note' && (
                      <div className="activity-actions">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setEditingId(a.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {a.kind === 'meeting' && (
                      <div className="activity-actions">
                        <a
                          className="btn btn-sm"
                          href={`#meetings/${a.meetingId}`}
                        >
                          View
                        </a>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => handleUnlinkMeeting(a.meetingId)}
                        >
                          Unlink
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="activity-text">{a.text}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

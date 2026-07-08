import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { marked } from 'marked'
import TimeStrip, { KIND_CLASS } from '../components/TimeStrip'
import {
  listMeetings,
  saveMeeting,
  deleteMeeting,
  listTeamMembers,
  listEngagements,
  listPartners,
} from '../db'

const today = () => new Date().toISOString().slice(0, 10)

const parseAttendees = (str) => (str || '').split(',').map((s) => s.trim()).filter(Boolean)
const joinAttendees = (list) => list.join(', ')

const EMPTY_MEETING = {
  title: '',
  date: today(),
  attendees: '',
  link: '',
  summary: '',
  engagementIds: [],
  partnerIds: [],
}

function meetingMissingFields(draft) {
  const missing = []
  if (!draft.title?.trim()) missing.push('title')
  if (!draft.date?.trim()) missing.push('date')
  if (!draft.attendees?.trim()) missing.push('attendees')
  if (!draft.summary?.trim()) missing.push('summary')
  return missing
}

function IdMultiSelect({ label, ids, items, setField, fieldKey }) {
  const selected = ids || []
  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id]
    setField(fieldKey, next)
  }

  if (!items.length) {
    return (
      <div className="related-to-group">
        <span className="related-to-label">{label}</span>
        <span className="muted">None yet</span>
      </div>
    )
  }

  return (
    <div className="related-to-group">
      <span className="related-to-label">{label}</span>
      <div className="multi-select">
        {items.map((item) => (
          <label key={item.id} className="multi-select-item">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function AttendeesEditor({ attendees, onChange }) {
  const members = useLiveQuery(listTeamMembers) ?? []
  const [guest, setGuest] = useState('')
  const list = parseAttendees(attendees)

  const add = (name) => {
    const trimmed = name.trim()
    if (!trimmed || list.some((a) => a.toLowerCase() === trimmed.toLowerCase())) return
    onChange(joinAttendees([...list, trimmed]))
  }

  const remove = (name) => {
    onChange(joinAttendees(list.filter((a) => a !== name)))
  }

  const addGuest = (e) => {
    e.preventDefault()
    add(guest)
    setGuest('')
  }

  const rosterNames = new Set(members.map((m) => m.name.toLowerCase()))
  const available = members.filter((m) => !list.some((a) => a.toLowerCase() === m.name.toLowerCase()))

  return (
    <div className="attendees-editor">
      <div className="chip-list attendees-chips">
        {list.length === 0 && <span className="muted">No attendees yet *</span>}
        {list.map((name) => (
          <span key={name} className={`chip ${rosterNames.has(name.toLowerCase()) ? '' : 'chip-legacy'}`}>
            {name}
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${name}`}
              onClick={() => remove(name)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="attendees-add">
        <select
          value=""
          onChange={(e) => e.target.value && add(e.target.value)}
        >
          <option value="">+ Team member…</option>
          {available.map((m) => (
            <option key={m.id} value={m.name}>{m.name}{m.team ? ` (${m.team})` : ''}</option>
          ))}
        </select>
        <input
          placeholder="Guest name (not on team)"
          value={guest}
          onChange={(e) => setGuest(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addGuest(e) }}
        />
        <button type="button" className="btn btn-sm" onClick={addGuest}>Add</button>
      </div>
    </div>
  )
}

function RelatedToEditor({ draft, setDraft }) {
  const engagements = useLiveQuery(listEngagements) ?? []
  const partners = useLiveQuery(listPartners) ?? []
  const setField = (key, value) => setDraft({ ...draft, [key]: value })

  return (
    <div className="related-to-section">
      <span className="related-to-heading">Related to (optional)</span>
      <div className="related-to-groups">
        <IdMultiSelect
          label="Engagements"
          ids={draft.engagementIds}
          items={engagements}
          setField={setField}
          fieldKey="engagementIds"
        />
        <IdMultiSelect
          label="Partners & Data Providers"
          ids={draft.partnerIds}
          items={partners}
          setField={setField}
          fieldKey="partnerIds"
        />
      </div>
    </div>
  )
}

function MeetingEditor({ draft, setDraft, onSave, onCancel }) {
  const missing = meetingMissingFields(draft)
  const canSave = missing.length === 0

  return (
    <div className="meeting-detail">
      <div className="meeting-edit-form">
        <input
          placeholder="Meeting title *"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
        />
        <AttendeesEditor
          attendees={draft.attendees}
          onChange={(attendees) => setDraft({ ...draft, attendees })}
        />
        <RelatedToEditor draft={draft} setDraft={setDraft} />
        <input
          placeholder="Granola link (optional)"
          value={draft.link}
          onChange={(e) => setDraft({ ...draft, link: e.target.value })}
        />
        <textarea
          className="markdown-editor"
          placeholder="Paste the Granola summary here (markdown)… *"
          value={draft.summary}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          rows={18}
        />
        {!canSave && (
          <p className="validation-hint muted">
            Required: {missing.join(', ')}
          </p>
        )}
        <div className="btn-group">
          <button className="btn btn-primary" onClick={onSave} disabled={!canSave}>Save</button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function RelatedChips({ engagementIds, partnerIds }) {
  const engagements = useLiveQuery(listEngagements) ?? []
  const partners = useLiveQuery(listPartners) ?? []
  const engNames = (engagementIds || [])
    .map((id) => engagements.find((e) => e.id === id)?.name)
    .filter(Boolean)
  const partnerNames = (partnerIds || [])
    .map((id) => partners.find((p) => p.id === id)?.name)
    .filter(Boolean)

  if (!engNames.length && !partnerNames.length) return null

  return (
    <p className="meeting-related">
      {engNames.length > 0 && (
        <span>
          Engagements:{' '}
          {engNames.map((n) => <span key={n} className="chip">{n}</span>)}
        </span>
      )}
      {partnerNames.length > 0 && (
        <span>
          {engNames.length ? ' · ' : ''}
          Partners:{' '}
          {partnerNames.map((n) => <span key={n} className="chip">{n}</span>)}
        </span>
      )}
    </p>
  )
}

function MeetingTimeline() {
  const meetings = useLiveQuery(listMeetings) ?? []
  const engagements = useLiveQuery(listEngagements) ?? []
  const partners = useLiveQuery(listPartners) ?? []

  const stripItems = meetings.map((m) => ({
    id: m.id,
    kind: 'meeting',
    createdAt: `${m.date}T12:00:00.000Z`,
    text: m.title,
  }))

  const engagementById = Object.fromEntries(engagements.map((e) => [e.id, e]))
  const partnerById = Object.fromEntries(partners.map((p) => [p.id, p]))

  if (meetings.length === 0) {
    return <p className="muted">No meetings yet — add a summary on the Summaries tab.</p>
  }

  return (
    <div className="meeting-timeline">
      <TimeStrip items={stripItems} />
      <ul className="activity-feed timeline-feed">
        {meetings.map((m) => {
          const engNames = (m.engagementIds || [])
            .map((id) => engagementById[id]?.name)
            .filter(Boolean)
          const partnerNames = (m.partnerIds || [])
            .map((id) => partnerById[id]?.name)
            .filter(Boolean)

          return (
            <li key={m.id} className="activity-item">
              <div className="activity-item-head">
                <span className={`badge activity-badge ${KIND_CLASS.meeting}`}>
                  meeting
                </span>
                <time className="activity-date">
                  {new Date(m.date + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </time>
                <div className="activity-actions">
                  <a className="btn btn-sm" href={`#meetings/${m.id}`}>View</a>
                </div>
              </div>
              <p className="activity-text timeline-meeting-title">{m.title}</p>
              {m.attendees && (
                <p className="muted timeline-meeting-meta">{m.attendees}</p>
              )}
              {(engNames.length > 0 || partnerNames.length > 0) && (
                <div className="chip-list timeline-chips">
                  {engNames.map((name) => (
                    <span key={`e-${name}`} className="chip">{name}</span>
                  ))}
                  {partnerNames.map((name) => (
                    <span key={`p-${name}`} className="chip chip-legacy">{name}</span>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function MeetingDetail({ meeting, onDelete, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const startEdit = () => {
    setDraft({ ...meeting })
    setEditing(true)
  }

  const save = async () => {
    if (meetingMissingFields(draft).length) return
    const saved = await saveMeeting(draft)
    setEditing(false)
    setDraft(null)
    onSaved?.(saved)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(null)
  }

  if (editing) {
    return (
      <MeetingEditor
        draft={draft}
        setDraft={setDraft}
        onSave={save}
        onCancel={cancel}
      />
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
          <RelatedChips
            engagementIds={meeting.engagementIds}
            partnerIds={meeting.partnerIds}
          />
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

export default function Meetings({ meetingId }) {
  const meetings = useLiveQuery(listMeetings) ?? []
  const [tab, setTab] = useState('summaries')
  const [activeId, setActiveId] = useState(meetingId ?? null)
  const [draft, setDraft] = useState(null)

  useEffect(() => {
    if (meetingId) {
      setActiveId(meetingId)
      setTab('summaries')
    }
  }, [meetingId])

  const active = draft
    ? null
    : meetings.find((m) => m.id === activeId) ?? meetings[0]

  const startNew = () => {
    setActiveId(null)
    setDraft({ ...EMPTY_MEETING })
  }

  const saveNew = async () => {
    if (meetingMissingFields(draft).length) return
    const meeting = await saveMeeting(draft)
    setDraft(null)
    setActiveId(meeting.id)
    window.location.hash = `meetings/${meeting.id}`
  }

  const cancelNew = () => {
    setDraft(null)
    if (meetings.length) setActiveId(meetings[0].id)
  }

  const handleDelete = async (meeting) => {
    if (!confirm(`Delete "${meeting.title}"?`)) return
    await deleteMeeting(meeting.id)
    setActiveId(null)
    setDraft(null)
    window.location.hash = 'meetings'
  }

  const selectMeeting = (id) => {
    setActiveId(id)
    setDraft(null)
    window.location.hash = `meetings/${id}`
  }

  return (
    <div className="page meetings">
      <h1>Team Meetings</h1>
      <p className="subtitle">Meeting summaries from Granola notes — newest first.</p>

      <div className="tabs">
        <button
          className={`tab ${tab === 'summaries' ? 'active' : ''}`}
          onClick={() => setTab('summaries')}
        >
          Summaries
        </button>
        <button
          className={`tab ${tab === 'timeline' ? 'active' : ''}`}
          onClick={() => setTab('timeline')}
        >
          Timeline ({meetings.length})
        </button>
      </div>

      {tab === 'timeline' ? (
        <MeetingTimeline />
      ) : (
        <div className="process-layout">
          <aside className="process-list">
            <button className="btn btn-primary btn-sm new-meeting-btn" onClick={startNew}>
              + New Meeting
            </button>
            <ul>
              {meetings.map((m) => (
                <li key={m.id}>
                  <button
                    className={`process-link ${active?.id === m.id && !draft ? 'active' : ''}`}
                    onClick={() => selectMeeting(m.id)}
                  >
                    <span className="meeting-list-title">{m.title}</span>
                    <span className="meeting-list-date">{m.date}</span>
                  </button>
                </li>
              ))}
              {meetings.length === 0 && !draft && <li className="muted">No meetings yet.</li>}
            </ul>
          </aside>

          <div className="process-content">
            {draft ? (
              <MeetingEditor
                draft={draft}
                setDraft={setDraft}
                onSave={saveNew}
                onCancel={cancelNew}
              />
            ) : active ? (
              <MeetingDetail
                meeting={active}
                onDelete={handleDelete}
                onSaved={(saved) => {
                  setActiveId(saved.id)
                  window.location.hash = `meetings/${saved.id}`
                }}
              />
            ) : (
              <p className="muted">Click + New Meeting to add a summary.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

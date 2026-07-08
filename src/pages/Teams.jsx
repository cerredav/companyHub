import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import MarkdownDoc from '../components/MarkdownDoc'
import AttachmentList from '../components/AttachmentList'
import {
  listTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  listEngagements,
  listBuckets,
  saveBucket,
  deleteBucket,
} from '../db'

const MEMBER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'email', label: 'Email' },
  { key: 'location', label: 'Location' },
  { key: 'timezone', label: 'Timezone' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const EMPTY_MEMBER = {
  name: '', role: '', team: '', email: '', location: '', timezone: '', notes: '',
}

function formatLocalTime(timezone) {
  if (!timezone) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date())
  } catch {
    return null
  }
}

function MemberMeta({ member }) {
  const localTime = formatLocalTime(member.timezone)
  return (
    <>
      {member.role && <span className="muted"> — {member.role}</span>}
      {member.location && <span className="muted"> · {member.location}</span>}
      {member.timezone && (
        <span className="muted">
          {' · '}{member.timezone}{localTime ? ` (${localTime})` : ''}
        </span>
      )}
      {member.email && <span className="muted"> · {member.email}</span>}
    </>
  )
}

function LinksEditor({ bucket }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const links = bucket.links ?? []

  const addLink = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    await saveBucket({
      ...bucket,
      links: [...links, { label: label.trim() || url.trim(), url: url.trim() }],
    })
    setLabel('')
    setUrl('')
  }

  const removeLink = async (idx) => {
    await saveBucket({ ...bucket, links: links.filter((_, i) => i !== idx) })
  }

  return (
    <div className="links-editor">
      <h3 className="bucket-subheading">Links</h3>
      {links.length === 0 ? (
        <p className="muted">No links yet.</p>
      ) : (
        <ul className="links-list">
          {links.map((l, idx) => (
            <li key={idx}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
              <button className="btn btn-sm btn-danger" onClick={() => removeLink(idx)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      <form className="link-form" onSubmit={addLink}>
        <input
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit">Add</button>
      </form>
    </div>
  )
}

function TeamSections({ teamName }) {
  const buckets = useLiveQuery(() => listBuckets(teamName), [teamName]) ?? []
  const [activeId, setActiveId] = useState(null)
  const [newName, setNewName] = useState('')

  const active = buckets.find((b) => b.id === activeId) ?? buckets[0]

  const handleCreate = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const bucket = await saveBucket({ team: teamName, name, notes: '', links: [] })
    setNewName('')
    setActiveId(bucket.id)
  }

  const handleDelete = async () => {
    if (!active || !confirm(`Delete section "${active.name}" and its documents?`)) return
    await deleteBucket(active.id)
    setActiveId(null)
  }

  return (
    <div className="team-sections">
      <h2 className="section-heading">Sections</h2>
      <p className="muted section-note">Notes, documents, and links organized per topic.</p>

      <div className="bucket-bar">
        <div className="tabs bucket-tabs">
          {buckets.map((b) => (
            <button
              key={b.id}
              className={`tab ${active?.id === b.id ? 'active' : ''}`}
              onClick={() => setActiveId(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
        <form className="new-doc-form bucket-add" onSubmit={handleCreate}>
          <input
            placeholder="New section…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">Add</button>
        </form>
      </div>

      {active ? (
        <div className="bucket-content">
          <MarkdownDoc
            compact
            title={active.name}
            body={active.notes || `Notes for ${active.name}.`}
            onSave={(notes) => saveBucket({ ...active, notes })}
            onDelete={handleDelete}
          />
          <LinksEditor bucket={active} />
          <AttachmentList
            parentType="bucket"
            parentId={active.id}
            title="Documents"
          />
        </div>
      ) : (
        <p className="muted">Add a section to organize this team's notes, documents, and links.</p>
      )}
    </div>
  )
}

function TeamDetail({ teamName }) {
  const members = useLiveQuery(listTeamMembers) ?? []
  const engagements = useLiveQuery(listEngagements) ?? []

  const teamMembers = members.filter(
    (m) => (m.team || 'Unassigned') === teamName
  )
  const memberNames = new Set(teamMembers.map((m) => m.name.toLowerCase()))

  // ponytail: owner-name match only — wrong/missing owner means engagement won't show here
  const teamEngagements = engagements.filter(
    (e) => e.owner && memberNames.has(e.owner.toLowerCase())
  )

  return (
    <div className="page team-detail">
      <a href="#teams" className="back-link">← All teams</a>
      <h1>{teamName}</h1>
      <p className="subtitle">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</p>

      <h2 className="section-heading">Members</h2>
      {teamMembers.length === 0 ? (
        <p className="muted">No members on this team.</p>
      ) : (
        <ul className="member-list">
          {teamMembers.map((m) => (
            <li key={m.id}>
              <strong>{m.name}</strong>
              <MemberMeta member={m} />
            </li>
          ))}
        </ul>
      )}

      <h2 className="section-heading">Engagements</h2>
      <p className="muted section-note">Owned by team members — edit on the Engagements page.</p>
      {teamEngagements.length === 0 ? (
        <p className="muted">No engagements owned by this team.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody>
              {teamEngagements.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                  </td>
                  <td>{e.nextStep || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeamSections teamName={teamName} />
    </div>
  )
}

export default function Teams({ teamName }) {
  const members = useLiveQuery(listTeamMembers) ?? []

  if (teamName) {
    return <TeamDetail teamName={teamName} />
  }

  const byTeam = members.reduce((acc, m) => {
    const team = m.team || 'Unassigned'
    if (!acc[team]) acc[team] = []
    acc[team].push(m)
    return acc
  }, {})

  const teams = Object.keys(byTeam).sort()

  return (
    <div className="page">
      <h1>Teams</h1>
      <p className="subtitle">Team roster — click a team for members, engagements, and sections.</p>

      <h2 className="section-heading">Team Roster</h2>
      <EditableTable
        rows={members}
        columns={MEMBER_COLUMNS}
        emptyRow={EMPTY_MEMBER}
        onSave={saveTeamMember}
        onDelete={deleteTeamMember}
        filterFn={(row, q) =>
          [row.name, row.role, row.team, row.email, row.location, row.timezone].some((v) =>
            String(v).toLowerCase().includes(q.toLowerCase())
          )
        }
      />

      {teams.length > 0 && (
        <div className="team-groups">
          <h2>By Team</h2>
          <div className="team-grid">
            {teams.map((team) => (
              <a
                key={team}
                href={`#teams/${encodeURIComponent(team)}`}
                className="team-card team-card--link"
              >
                <h3>{team}</h3>
                <ul>
                  {byTeam[team].map((m) => (
                    <li key={m.id}>
                      <strong>{m.name}</strong>
                      {m.location && <span className="muted"> · {m.location}</span>}
                      {m.timezone && <span className="muted"> · {m.timezone}</span>}
                    </li>
                  ))}
                </ul>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

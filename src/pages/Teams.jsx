import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import MarkdownDoc from '../components/MarkdownDoc'
import {
  listTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  listEngagements,
  getDocumentBySlug,
  saveDocument,
} from '../db'

const MEMBER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'email', label: 'Email' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const EMPTY_MEMBER = { name: '', role: '', team: '', email: '', notes: '' }

function teamSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function TeamDetail({ teamName }) {
  const members = useLiveQuery(listTeamMembers) ?? []
  const engagements = useLiveQuery(listEngagements) ?? []
  const slug = `team-${teamSlug(teamName)}`
  const notesDoc = useLiveQuery(() => getDocumentBySlug(slug), [slug])

  const teamMembers = members.filter(
    (m) => (m.team || 'Unassigned') === teamName
  )
  const memberNames = new Set(teamMembers.map((m) => m.name.toLowerCase()))

  // ponytail: owner-name match only — wrong/missing owner means engagement won't show here
  const teamEngagements = engagements.filter(
    (e) => e.owner && memberNames.has(e.owner.toLowerCase())
  )

  const defaultNotes = `# ${teamName}\n\nTeam focus, context, and notes.\n`

  const handleSaveNotes = async (body) => {
    if (notesDoc) {
      await saveDocument({ ...notesDoc, body })
    } else {
      await saveDocument({ slug, title: `${teamName} Team`, body })
    }
  }

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
              {m.role && <span className="muted"> — {m.role}</span>}
              {m.email && <span className="muted"> · {m.email}</span>}
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

      <MarkdownDoc
        compact
        title="Team Notes"
        body={notesDoc?.body ?? defaultNotes}
        onSave={handleSaveNotes}
      />
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
      <p className="subtitle">Team roster — click a team for members, engagements, and notes.</p>

      <h2 className="section-heading">Team Roster</h2>
      <EditableTable
        rows={members}
        columns={MEMBER_COLUMNS}
        emptyRow={EMPTY_MEMBER}
        onSave={saveTeamMember}
        onDelete={deleteTeamMember}
        filterFn={(row, q) =>
          [row.name, row.role, row.team, row.email].some((v) =>
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
                      {m.role && <span className="muted"> — {m.role}</span>}
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

import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import {
  listTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  listPolicies,
  savePolicy,
  deletePolicy,
} from '../db'

const MEMBER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'email', label: 'Email' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const POLICY_COLUMNS = [
  { key: 'name', label: 'Policy' },
  { key: 'lastUpdated', label: 'Last Updated' },
  {
    key: 'link',
    label: 'Link',
    render: (val) =>
      val ? (
        <a href={val} target="_blank" rel="noopener noreferrer">Open</a>
      ) : (
        '—'
      ),
  },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const EMPTY_MEMBER = { name: '', role: '', team: '', email: '', notes: '' }
const EMPTY_POLICY = { name: '', lastUpdated: '', link: '', notes: '' }

export default function Teams() {
  const members = useLiveQuery(listTeamMembers) ?? []
  const policies = useLiveQuery(listPolicies) ?? []

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
      <p className="subtitle">Team roster and company-wide policies.</p>

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
              <div key={team} className="team-card">
                <h3>{team}</h3>
                <ul>
                  {byTeam[team].map((m) => (
                    <li key={m.id}>
                      <strong>{m.name}</strong>
                      {m.role && <span className="muted"> — {m.role}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-heading">Policies</h2>
      <p className="muted section-note">Company-wide policies — links open the source document.</p>
      <EditableTable
        rows={policies}
        columns={POLICY_COLUMNS}
        emptyRow={EMPTY_POLICY}
        onSave={savePolicy}
        onDelete={deletePolicy}
        filterFn={(row, q) =>
          [row.name, row.notes].some((v) =>
            String(v).toLowerCase().includes(q.toLowerCase())
          )
        }
      />
    </div>
  )
}

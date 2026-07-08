import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import { listTeamMembers, saveTeamMember, deleteTeamMember } from '../db'

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'email', label: 'Email' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const EMPTY = { name: '', role: '', team: '', email: '', notes: '' }

export default function Teams() {
  const members = useLiveQuery(listTeamMembers) ?? []

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
      <p className="subtitle">Who does what — grouped by team.</p>

      <EditableTable
        rows={members}
        columns={COLUMNS}
        emptyRow={EMPTY}
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
    </div>
  )
}

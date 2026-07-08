import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import { listPolicies, savePolicy, deletePolicy } from '../db'

const COLUMNS = [
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

const EMPTY = { name: '', lastUpdated: '', link: '', notes: '' }

export default function Policies() {
  const policies = useLiveQuery(listPolicies) ?? []

  return (
    <div className="page">
      <h1>Policies</h1>
      <p className="subtitle">Company-wide policies — links open the source document.</p>

      <EditableTable
        rows={policies}
        columns={COLUMNS}
        emptyRow={EMPTY}
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

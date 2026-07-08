import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import MarkdownDoc from '../components/MarkdownDoc'
import AttachmentList from '../components/AttachmentList'
import { listPolicies, savePolicy, deletePolicy } from '../db'

const COLUMNS = [
  {
    key: 'name',
    label: 'Policy',
    render: (val, row) => (
      <a href={`#policies/${row.id}`}>{val || '—'}</a>
    ),
  },
  {
    key: 'lastUpdated',
    label: 'Last Updated',
    render: (val) => val || '—',
  },
  {
    key: 'notes',
    label: 'Notes',
    render: (val) => val || '—',
  },
]

const EMPTY = { name: '', notes: '', body: '' }

function PolicyDetail({ policy }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const startEdit = () => {
    setDraft({ name: policy.name, notes: policy.notes || '' })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
  }

  const saveMeta = async () => {
    const name = draft.name.trim()
    if (!name) return
    await savePolicy({ ...policy, name, notes: draft.notes })
    cancelEdit()
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${policy.name}"?`)) return
    await deletePolicy(policy.id)
    window.location.hash = 'policies'
  }

  return (
    <div className="page policy-detail">
      <a href="#policies" className="back-link">← All policies</a>

      {editing ? (
        <div className="policy-meta-form">
          <input
            placeholder="Policy name *"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <textarea
            placeholder="Notes (optional)"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            rows={3}
          />
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={saveMeta}
              disabled={!draft.name.trim()}
            >
              Save
            </button>
            <button className="btn" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="page-header">
          <div>
            <h1>{policy.name}</h1>
            {policy.lastUpdated && (
              <p className="subtitle">Last updated {policy.lastUpdated}</p>
            )}
            {policy.notes && <p className="muted policy-notes">{policy.notes}</p>}
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={startEdit}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      <MarkdownDoc
        compact
        title="Policy Text"
        body={policy.body || '_No text policy yet — click Edit to add markdown._'}
        onSave={(body) => savePolicy({ ...policy, body })}
      />

      <AttachmentList
        parentType="policy"
        parentId={policy.id}
        title="Policy Documents"
      />
    </div>
  )
}

export default function Policies({ policyId }) {
  const policies = useLiveQuery(listPolicies) ?? []

  if (policyId) {
    const policy = policies.find((p) => p.id === policyId)
    if (!policy) {
      return (
        <div className="page">
          <a href="#policies" className="back-link">← All policies</a>
          <p className="muted">Policy not found.</p>
        </div>
      )
    }
    return <PolicyDetail policy={policy} />
  }

  return (
    <div className="page">
      <h1>Policies</h1>
      <p className="subtitle">Company-wide policies — click a name to view and edit.</p>

      <EditableTable
        rows={policies}
        columns={COLUMNS}
        emptyRow={EMPTY}
        onSave={savePolicy}
        onDelete={deletePolicy}
        hideRowEdit
        filterFn={(row, q) =>
          [row.name, row.notes].some((v) =>
            String(v).toLowerCase().includes(q.toLowerCase())
          )
        }
      />
    </div>
  )
}

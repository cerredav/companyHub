import { useState, Fragment } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { countFiles, countActivities, countMeetingsFor } from '../db'

const EMPTY = {}

function DetailButton({ row, parentType, expandedId, onToggle }) {
  const fileCount = useLiveQuery(() => countFiles(parentType, row.id), [parentType, row.id]) ?? 0
  const activityCount = useLiveQuery(() => countActivities(parentType, row.id), [parentType, row.id]) ?? 0
  const meetingCount = useLiveQuery(() => countMeetingsFor(parentType, row.id), [parentType, row.id]) ?? 0
  const parts = []
  if (activityCount) parts.push(`${activityCount} update${activityCount !== 1 ? 's' : ''}`)
  if (meetingCount) parts.push(`${meetingCount} meeting${meetingCount !== 1 ? 's' : ''}`)
  if (fileCount) parts.push(`${fileCount} file${fileCount !== 1 ? 's' : ''}`)
  const label = parts.length ? `History · ${parts.join(', ')}` : 'History'

  return (
    <button
      className={`btn btn-sm ${expandedId === row.id ? 'btn-primary' : ''}`}
      onClick={() => onToggle(row.id)}
      title="Updates, activity timeline, and documents"
    >
      {label}
    </button>
  )
}

export default function EditableTable({
  rows,
  columns,
  onSave,
  onDelete,
  emptyRow = EMPTY,
  filterFn,
  rowDetail,
  rowDetailParentType,
  hideRowEdit = false,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const visible = filterFn && filter
    ? rows.filter((r) => filterFn(r, filter))
    : rows

  const colSpan = columns.length + 1

  const startAdd = () => {
    setEditingId('new')
    setDraft({ ...emptyRow })
    setExpandedId(null)
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setDraft({ ...row })
    setExpandedId(null)
  }

  const cancel = () => {
    setEditingId(null)
    setDraft(null)
  }

  const save = async () => {
    await onSave(draft)
    cancel()
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await onDelete(id)
      if (editingId === id) cancel()
      if (expandedId === id) setExpandedId(null)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const setField = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const renderCell = (col, row) => {
    if (col.render) return col.render(row[col.key], row)
    if (col.type === 'select') {
      return (
        <span className={`badge badge-${String(row[col.key]).replace(/\s+/g, '-')}`}>
          {row[col.key]}
        </span>
      )
    }
    return row[col.key] || '—'
  }

  const renderEditCell = (col) => {
    if (col.editRender) return col.editRender(draft, setField)
    return renderField(col)
  }

  const renderField = (col) => {
    const val = draft[col.key] ?? ''
    if (col.type === 'select') {
      return (
        <select value={val} onChange={(e) => setField(col.key, e.target.value)}>
          <option value="">—</option>
          {col.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )
    }
    if (col.type === 'textarea') {
      return (
        <textarea
          value={val}
          onChange={(e) => setField(col.key, e.target.value)}
          rows={2}
        />
      )
    }
    return (
      <input
        type={col.type === 'date' ? 'date' : 'text'}
        value={val}
        onChange={(e) => setField(col.key, e.target.value)}
      />
    )
  }

  const renderActions = (row) => (
    <td className="actions">
      {rowDetail && rowDetailParentType && (
        <DetailButton
          row={row}
          parentType={rowDetailParentType}
          expandedId={expandedId}
          onToggle={toggleExpand}
        />
      )}
      {!hideRowEdit && (
        <button className="btn btn-sm" onClick={() => startEdit(row)}>Edit</button>
      )}
      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
    </td>
  )

  return (
    <div className="editable-table">
      <div className="table-toolbar">
        {filterFn && (
          <input
            className="filter-input"
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        )}
        <button className="btn btn-primary" onClick={startAdd}>+ Add</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="editing-row">
                {columns.map((c) => (
                  <td key={c.key}>{renderEditCell(c)}</td>
                ))}
                <td className="actions">
                  <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                  <button className="btn btn-sm" onClick={cancel}>Cancel</button>
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <Fragment key={row.id}>
                {editingId === row.id ? (
                  <tr key={row.id} className="editing-row">
                    {columns.map((c) => (
                      <td key={c.key}>{renderEditCell(c)}</td>
                    ))}
                    <td className="actions">
                      <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                      <button className="btn btn-sm" onClick={cancel}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    {columns.map((c) => (
                      <td key={c.key}>{renderCell(c, row)}</td>
                    ))}
                    {renderActions(row)}
                  </tr>
                )}
                {rowDetail && expandedId === row.id && editingId !== row.id && (
                  <tr key={`${row.id}-detail`} className="row-detail">
                    <td colSpan={colSpan}>{rowDetail(row)}</td>
                  </tr>
                )}
              </Fragment>
            ))}
            {visible.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={colSpan} className="empty">No items yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

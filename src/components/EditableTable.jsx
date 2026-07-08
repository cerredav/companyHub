import { useState } from 'react'

const EMPTY = {}

export default function EditableTable({
  rows,
  columns,
  onSave,
  onDelete,
  emptyRow = EMPTY,
  filterFn,
}) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [filter, setFilter] = useState('')

  const visible = filterFn && filter
    ? rows.filter((r) => filterFn(r, filter))
    : rows

  const startAdd = () => {
    setEditingId('new')
    setDraft({ ...emptyRow })
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setDraft({ ...row })
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
    }
  }

  const setField = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const renderCell = (col, row) => {
    if (col.render) return col.render(row[col.key], row)
    if (col.type === 'select') {
      return (
        <span className={`badge badge-${row[col.key]}`}>{row[col.key]}</span>
      )
    }
    return row[col.key] || '—'
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
                  <td key={c.key}>{renderField(c)}</td>
                ))}
                <td className="actions">
                  <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                  <button className="btn btn-sm" onClick={cancel}>Cancel</button>
                </td>
              </tr>
            )}
            {visible.map((row) =>
              editingId === row.id ? (
                <tr key={row.id} className="editing-row">
                  {columns.map((c) => (
                    <td key={c.key}>{renderField(c)}</td>
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
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => startEdit(row)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                </tr>
              )
            )}
            {visible.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={columns.length + 1} className="empty">No items yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

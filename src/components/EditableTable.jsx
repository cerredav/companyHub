import { useState, Fragment, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { countFiles, countActivities, countMeetingsFor } from '../db'

const EMPTY = {}

function useHistoryTooltip(row, parentType) {
  const fileCount = useLiveQuery(async () => {
    if (!parentType) return 0
    return countFiles(parentType, row.id)
  }, [parentType, row.id]) ?? 0
  const activityCount = useLiveQuery(async () => {
    if (!parentType) return 0
    return countActivities(parentType, row.id)
  }, [parentType, row.id]) ?? 0
  const meetingCount = useLiveQuery(async () => {
    if (!parentType) return 0
    return countMeetingsFor(parentType, row.id)
  }, [parentType, row.id]) ?? 0
  const parts = []
  if (activityCount) parts.push(`${activityCount} update${activityCount !== 1 ? 's' : ''}`)
  if (meetingCount) parts.push(`${meetingCount} meeting${meetingCount !== 1 ? 's' : ''}`)
  if (fileCount) parts.push(`${fileCount} file${fileCount !== 1 ? 's' : ''}`)
  return parts.length
    ? `History · ${parts.join(', ')}`
    : 'Updates, activity timeline, and documents'
}

function RowActionsMenu({
  row,
  open,
  onOpenChange,
  rowDetail,
  rowDetailParentType,
  expandedId,
  onToggleHistory,
  hideRowEdit,
  onEdit,
  onDelete,
}) {
  const menuRef = useRef(null)
  const historyTooltip = useHistoryTooltip(row, rowDetailParentType)

  useEffect(() => {
    if (!open) return
    const closeOnOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onOpenChange(false)
    }
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, onOpenChange])

  const run = (action) => {
    onOpenChange(false)
    action()
  }

  return (
    <div className="row-menu" ref={menuRef}>
      <button
        type="button"
        className="row-menu-trigger"
        onClick={() => onOpenChange(!open)}
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ⋯
      </button>
      {open && (
        <div className="row-menu-dropdown" role="menu">
          {rowDetail && rowDetailParentType && (
            <button
              type="button"
              className={`row-menu-item${expandedId === row.id ? ' row-menu-item--active' : ''}`}
              role="menuitem"
              title={historyTooltip}
              onClick={() => run(() => onToggleHistory(row.id))}
            >
              History
            </button>
          )}
          {!hideRowEdit && (
            <button
              type="button"
              className="row-menu-item"
              role="menuitem"
              onClick={() => run(() => onEdit(row))}
            >
              Edit
            </button>
          )}
          <button
            type="button"
            className="row-menu-item row-menu-item--danger"
            role="menuitem"
            onClick={() => run(() => onDelete(row.id))}
          >
            Delete
          </button>
        </div>
      )}
    </div>
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
  const [openMenuId, setOpenMenuId] = useState(null)

  const visible = filterFn && filter
    ? rows.filter((r) => filterFn(r, filter))
    : rows

  const colSpan = columns.length + 1

  const startAdd = () => {
    setEditingId('new')
    setDraft({ ...emptyRow })
    setExpandedId(null)
    setOpenMenuId(null)
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setDraft({ ...row })
    setExpandedId(null)
    setOpenMenuId(null)
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
      <RowActionsMenu
        row={row}
        open={openMenuId === row.id}
        onOpenChange={(isOpen) => setOpenMenuId(isOpen ? row.id : null)}
        rowDetail={rowDetail}
        rowDetailParentType={rowDetailParentType}
        expandedId={expandedId}
        onToggleHistory={toggleExpand}
        hideRowEdit={hideRowEdit}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
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
          <colgroup>
            <col className="actions-col" />
            {columns.map((c) => (
              <col key={c.key} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="actions-col">Actions</th>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="editing-row">
                <td className="actions">
                  <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                  <button className="btn btn-sm" onClick={cancel}>Cancel</button>
                </td>
                {columns.map((c) => (
                  <td key={c.key}>{renderEditCell(c)}</td>
                ))}
              </tr>
            )}
            {visible.map((row) => (
              <Fragment key={row.id}>
                {editingId === row.id ? (
                  <tr key={row.id} className="editing-row">
                    <td className="actions">
                      <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
                      <button className="btn btn-sm" onClick={cancel}>Cancel</button>
                    </td>
                    {columns.map((c) => (
                      <td key={c.key}>{renderEditCell(c)}</td>
                    ))}
                  </tr>
                ) : (
                  <tr key={row.id}>
                    {renderActions(row)}
                    {columns.map((c) => (
                      <td key={c.key}>{renderCell(c, row)}</td>
                    ))}
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

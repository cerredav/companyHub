import { useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { listFiles, addFile, deleteFile, downloadFile } from '../db'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentList({ parentType, parentId, title = 'Supporting Documents' }) {
  const files = useLiveQuery(() => listFiles(parentType, parentId), [parentType, parentId]) ?? []
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const selected = [...(e.target.files || [])]
    for (const file of selected) {
      await addFile(parentType, parentId, file)
    }
    e.target.value = ''
  }

  const handleDelete = async (id, name) => {
    if (confirm(`Delete "${name}"?`)) {
      await deleteFile(id)
    }
  }

  return (
    <div className="attachment-list">
      <div className="attachment-header">
        <h3>{title}</h3>
        <button className="btn btn-sm btn-primary" onClick={() => inputRef.current?.click()}>
          + Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>

      {files.length === 0 ? (
        <p className="muted">No files attached.</p>
      ) : (
        <ul className="attachment-items">
          {files.map((f) => (
            <li key={f.id} className="attachment-item">
              <div className="attachment-meta">
                <span className="attachment-name">{f.name}</span>
                <span className="attachment-size">{formatSize(f.size)}</span>
                <span className="attachment-date">
                  {new Date(f.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="attachment-actions">
                <button className="btn btn-sm" onClick={() => downloadFile(f)}>Download</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id, f.name)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

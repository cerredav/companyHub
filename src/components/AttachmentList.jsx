import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { listFiles, addFile, deleteFile, downloadFile } from '../db'
import { isPdf, isPptx, isImage, isVideo, isPreviewable } from '../lib/fileTypes'
import { renderPdfThumbnail } from '../lib/pdf'
import { renderPptxThumbnail } from '../lib/pptx'
import { renderVideoThumbnail } from '../lib/video'
import FileViewerDialog from './FileViewerDialog'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileThumb({ file, onOpen }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)
  const label = isPdf(file) ? 'PDF' : isPptx(file) ? 'PPTX' : isImage(file) ? 'IMG' : isVideo(file) ? 'VIDEO' : 'FILE'

  useEffect(() => {
    let cancelled = false
    let objectUrl = null
    setSrc(null)
    setFailed(false)

    if (isImage(file)) {
      objectUrl = URL.createObjectURL(file.blob)
      if (!cancelled) setSrc(objectUrl)
      return () => {
        cancelled = true
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      }
    }

    const render = isPdf(file)
      ? renderPdfThumbnail(file.blob)
      : isPptx(file)
        ? renderPptxThumbnail(file.blob)
        : isVideo(file)
          ? renderVideoThumbnail(file.blob)
          : null

    if (!render) {
      setFailed(true)
      return
    }

    render
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => { cancelled = true }
  }, [file.id, file.blob, file.mimeType, file.name])

  return (
    <button
      type="button"
      className="attachment-thumb"
      onClick={() => onOpen(file)}
      title={`View ${file.name}`}
    >
      {src ? (
        <img src={src} alt="" className="attachment-thumb-img" />
      ) : (
        <span className="attachment-thumb-fallback">
          {failed ? label : '…'}
        </span>
      )}
    </button>
  )
}

export default function AttachmentList({ parentType, parentId, title = 'Supporting Documents' }) {
  const files = useLiveQuery(() => listFiles(parentType, parentId), [parentType, parentId]) ?? []
  const inputRef = useRef(null)
  const [viewerFile, setViewerFile] = useState(null)

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
      if (viewerFile?.id === id) setViewerFile(null)
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
              {isPreviewable(f) ? (
                <FileThumb file={f} onOpen={setViewerFile} />
              ) : (
                <span className="attachment-thumb attachment-thumb--generic" aria-hidden>
                  {f.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE'}
                </span>
              )}
              <div className="attachment-meta">
                {isPreviewable(f) ? (
                  <button
                    type="button"
                    className="attachment-name attachment-name--link"
                    onClick={() => setViewerFile(f)}
                  >
                    {f.name}
                  </button>
                ) : (
                  <span className="attachment-name">{f.name}</span>
                )}
                <span className="attachment-size">{formatSize(f.size)}</span>
                <span className="attachment-date">
                  {new Date(f.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="attachment-actions">
                {isPreviewable(f) && (
                  <button className="btn btn-sm" onClick={() => setViewerFile(f)}>View</button>
                )}
                <button className="btn btn-sm" onClick={() => downloadFile(f)}>Download</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id, f.name)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FileViewerDialog
        file={viewerFile}
        open={!!viewerFile}
        onClose={() => setViewerFile(null)}
      />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { isPdf, isPptx, isImage, isVideo } from '../lib/fileTypes'
import { loadPptxRenderer } from '../lib/pptx'

function PdfFrame({ file }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!file?.blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return <p className="muted file-viewer-empty">Loading preview…</p>

  return (
    <iframe
      className="file-viewer-frame"
      title={file?.name || 'PDF preview'}
      src={url}
    />
  )
}

function PptxFrame({ file }) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const [slideCount, setSlideCount] = useState(0)
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setIndex(0)
    setSlideCount(0)

    ;(async () => {
      try {
        const renderer = await loadPptxRenderer(file.blob)
        if (cancelled) {
          renderer.destroy()
          return
        }
        rendererRef.current = renderer
        setSlideCount(renderer.slideCount)
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not open presentation')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      rendererRef.current?.destroy()
      rendererRef.current = null
    }
  }, [file])

  useEffect(() => {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    if (!renderer || !canvas || loading || error || !slideCount) return

    let cancelled = false
    ;(async () => {
      try {
        const width = Math.min(960, canvas.parentElement?.clientWidth || 960)
        await renderer.renderSlide(index, canvas, width)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Could not render slide')
      }
    })()

    return () => { cancelled = true }
  }, [index, loading, error, slideCount, file])

  if (loading) return <p className="muted file-viewer-empty">Loading presentation…</p>
  if (error) return <p className="muted file-viewer-empty">{error}</p>

  return (
    <div className="pptx-viewer">
      <div className="pptx-viewer-toolbar">
        <button
          type="button"
          className="btn btn-sm"
          disabled={index <= 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          ← Prev
        </button>
        <span className="pptx-viewer-status">
          Slide {index + 1} / {slideCount}
        </span>
        <button
          type="button"
          className="btn btn-sm"
          disabled={index >= slideCount - 1}
          onClick={() => setIndex((i) => Math.min(slideCount - 1, i + 1))}
        >
          Next →
        </button>
      </div>
      <div className="pptx-viewer-stage">
        <canvas ref={canvasRef} className="pptx-viewer-canvas" />
      </div>
    </div>
  )
}

function ImageFrame({ file }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!file?.blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return <p className="muted file-viewer-empty">Loading preview…</p>

  return (
    <div className="media-viewer-stage">
      <img
        className="file-viewer-image"
        src={url}
        alt={file?.name || 'Image preview'}
      />
    </div>
  )
}

function VideoFrame({ file }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!file?.blob) {
      setUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return <p className="muted file-viewer-empty">Loading preview…</p>

  return (
    <div className="media-viewer-stage">
      <video
        className="file-viewer-video"
        src={url}
        controls
        autoPlay
        playsInline
      />
    </div>
  )
}

export default function FileViewerDialog({ file, open, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && file) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, file])

  return (
    <dialog
      ref={dialogRef}
      className="file-viewer-dialog"
      onClose={() => onClose?.()}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose?.()
      }}
    >
      <div className="file-viewer-shell" onClick={(e) => e.stopPropagation()}>
        <header className="file-viewer-header">
          <h2 className="file-viewer-title">{file?.name || 'Preview'}</h2>
          <button type="button" className="btn btn-sm" onClick={() => onClose?.()}>
            Close
          </button>
        </header>
        {open && file && isPdf(file) && <PdfFrame file={file} />}
        {open && file && isPptx(file) && <PptxFrame file={file} />}
        {open && file && isImage(file) && <ImageFrame file={file} />}
        {open && file && isVideo(file) && <VideoFrame file={file} />}
      </div>
    </dialog>
  )
}

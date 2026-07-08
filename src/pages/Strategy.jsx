import { useLiveQuery } from 'dexie-react-hooks'
import MarkdownDoc from '../components/MarkdownDoc'
import { getDocumentBySlug, saveDocument } from '../db'

export default function Strategy() {
  const doc = useLiveQuery(() => getDocumentBySlug('strategy'))

  if (!doc) return <p className="muted">Loading…</p>

  return (
    <MarkdownDoc
      title={doc.title}
      body={doc.body}
      onSave={(body) => saveDocument({ ...doc, body })}
    />
  )
}

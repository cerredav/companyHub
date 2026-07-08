/** Shared SVG time strip — items need { id, kind, createdAt, text } */

export const KIND_CLASS = {
  note: 'activity-note',
  change: 'activity-change',
  file: 'activity-file',
  meeting: 'activity-meeting',
}

export default function TimeStrip({ items }) {
  if (!items?.length || items.length < 2) return null

  const sorted = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const start = new Date(sorted[0].createdAt).getTime()
  const end = new Date(sorted[sorted.length - 1].createdAt).getTime()
  const span = Math.max(end - start, 1)
  const width = 480
  const height = 36
  const pad = 8

  return (
    <div className="activity-graph">
      <svg viewBox={`0 0 ${width} ${height}`} className="activity-graph-svg" aria-hidden>
        <line
          x1={pad}
          y1={height / 2}
          x2={width - pad}
          y2={height / 2}
          className="activity-graph-axis"
        />
        {sorted.map((a) => {
          const t = (new Date(a.createdAt).getTime() - start) / span
          const x = pad + t * (width - pad * 2)
          return (
            <circle
              key={a.id}
              cx={x}
              cy={height / 2}
              r={5}
              className={`activity-dot ${KIND_CLASS[a.kind] || ''}`}
            >
              <title>{`${new Date(a.createdAt).toLocaleString()} — ${a.text}`}</title>
            </circle>
          )
        })}
      </svg>
      <div className="activity-graph-labels">
        <span>{new Date(sorted[0].createdAt).toLocaleDateString()}</span>
        <span>{new Date(sorted[sorted.length - 1].createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import {
  listEngagements,
  saveEngagement,
  deleteEngagement,
  listPartners,
  savePartner,
  deletePartner,
} from '../db'

const ENGAGEMENT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type', type: 'select', options: ['pilot', 'contract', 'poc', 'internal'] },
  { key: 'partner', label: 'Partner' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'paused', 'completed', 'prospect'] },
  { key: 'stage', label: 'Stage' },
  { key: 'owner', label: 'Owner' },
  { key: 'startDate', label: 'Start', type: 'date' },
  { key: 'nextStep', label: 'Next Step' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const PARTNER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'kind', label: 'Kind', type: 'select', options: ['data provider', 'partner', 'vendor', 'client'] },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'prospect'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

const EMPTY_ENGAGEMENT = {
  name: '', type: 'pilot', partner: '', status: 'active',
  stage: '', owner: '', startDate: '', nextStep: '', notes: '',
}

const EMPTY_PARTNER = {
  name: '', kind: 'partner', contact: '', status: 'active', notes: '',
}

export default function Engagements() {
  const [tab, setTab] = useState('engagements')
  const engagements = useLiveQuery(listEngagements) ?? []
  const partners = useLiveQuery(listPartners) ?? []

  return (
    <div className="page">
      <h1>Engagements</h1>
      <p className="subtitle">Track pilots, contracts, and the partners behind them.</p>

      <div className="tabs">
        <button
          className={`tab ${tab === 'engagements' ? 'active' : ''}`}
          onClick={() => setTab('engagements')}
        >
          Engagements ({engagements.length})
        </button>
        <button
          className={`tab ${tab === 'partners' ? 'active' : ''}`}
          onClick={() => setTab('partners')}
        >
          Partners &amp; Data Providers ({partners.length})
        </button>
      </div>

      {tab === 'engagements' ? (
        <EditableTable
          rows={engagements}
          columns={ENGAGEMENT_COLUMNS}
          emptyRow={EMPTY_ENGAGEMENT}
          onSave={saveEngagement}
          onDelete={deleteEngagement}
          filterFn={(row, q) =>
            [row.name, row.partner, row.owner, row.status].some((v) =>
              String(v).toLowerCase().includes(q.toLowerCase())
            )
          }
        />
      ) : (
        <EditableTable
          rows={partners}
          columns={PARTNER_COLUMNS}
          emptyRow={EMPTY_PARTNER}
          onSave={savePartner}
          onDelete={deletePartner}
          filterFn={(row, q) =>
            [row.name, row.kind, row.contact, row.status].some((v) =>
              String(v).toLowerCase().includes(q.toLowerCase())
            )
          }
        />
      )}
    </div>
  )
}

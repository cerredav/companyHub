import { useState, useMemo, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import EditableTable from '../components/EditableTable'
import AttachmentList from '../components/AttachmentList'
import ActivityPanel from '../components/ActivityPanel'
import MarkdownDoc from '../components/MarkdownDoc'
import {
  listEngagements,
  saveEngagement,
  deleteEngagement,
  listPartners,
  savePartner,
  deletePartner,
  listAgreements,
  saveAgreement,
  deleteAgreement,
  listTeamMembers,
} from '../db'

const STATUS_OPTIONS = ['active', 'paused', 'completed', 'prospect']

function PartnerChips({ partnerIds, partners, legacyPartner }) {
  const names = (partnerIds || [])
    .map((id) => partners.find((p) => p.id === id)?.name)
    .filter(Boolean)

  if (names.length) {
    return (
      <div className="chip-list">
        {names.map((name) => (
          <span key={name} className="chip">{name}</span>
        ))}
      </div>
    )
  }

  if (legacyPartner) {
    return <span className="chip chip-legacy">{legacyPartner}</span>
  }

  return '—'
}

function EngagementChips({ partnerId, engagements }) {
  const linked = engagements.filter((e) => e.partnerIds?.includes(partnerId))
  if (!linked.length) return '—'

  return (
    <div className="chip-list">
      {linked.map((e) => (
        <span key={e.id} className="chip">{e.name}</span>
      ))}
    </div>
  )
}

function PartnerMultiSelect({ partnerIds, partners, setField }) {
  const ids = partnerIds || []
  const toggle = (id) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    setField('partnerIds', next)
  }

  if (!partners.length) {
    return <span className="muted">Add partners first</span>
  }

  return (
    <div className="multi-select">
      {partners.map((p) => (
        <label key={p.id} className="multi-select-item">
          <input
            type="checkbox"
            checked={ids.includes(p.id)}
            onChange={() => toggle(p.id)}
          />
          <span>{p.name}</span>
          <span className="multi-select-kind">{p.kind}</span>
        </label>
      ))}
    </div>
  )
}

/** Select bound to team member names; keeps legacy free-text values selectable */
function MemberSelect({ value, memberNames, onChange }) {
  const isLegacy = value && !memberNames.includes(value)
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {isLegacy && <option value={value}>{value} (not on roster)</option>}
      {memberNames.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  )
}

const EMPTY_ENGAGEMENT = {
  name: '', type: 'pilot', partner: '', partnerIds: [], status: 'active',
  stage: '', owner: '', poc: '', pocContact: '',
  startDate: '', nextStep: '', notes: '', description: '',
}

const EMPTY_PARTNER = {
  name: '', kind: 'partner', contact: '', status: 'active', owner: '', notes: '',
}

const EMPTY_AGREEMENT = {
  partner: '', mndaSigned: 'no', mndaDate: '', expiration: '',
  contact: '', email: '', sender: '', others: '', demo: '', notes: '',
}

const ENGAGEMENT_TABS = new Set(['engagements', 'partners', 'agreements'])

function engagementTabHash(tab) {
  return tab === 'engagements' ? 'engagements' : `engagements/${tab}`
}

export default function Engagements({ tab: hashTab }) {
  const [tab, setTab] = useState(() =>
    hashTab && ENGAGEMENT_TABS.has(hashTab) ? hashTab : 'engagements'
  )
  const engagements = useLiveQuery(listEngagements) ?? []
  const partners = useLiveQuery(listPartners) ?? []
  const agreements = useLiveQuery(listAgreements) ?? []
  const members = useLiveQuery(listTeamMembers) ?? []

  useEffect(() => {
    if (hashTab && ENGAGEMENT_TABS.has(hashTab)) setTab(hashTab)
  }, [hashTab])

  const selectTab = (next) => {
    setTab(next)
    window.location.hash = engagementTabHash(next)
  }

  const memberNames = useMemo(() => members.map((m) => m.name), [members])

  const memberColumn = (key, label) => ({
    key,
    label,
    editRender: (draft, setField) => (
      <MemberSelect
        value={draft[key]}
        memberNames={memberNames}
        onChange={(v) => setField(key, v)}
      />
    ),
  })

  const engagementColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', type: 'select', options: ['pilot', 'contract', 'poc', 'internal', 'prospect'] },
    {
      key: 'partnerIds',
      label: 'Partners',
      render: (_, row) => (
        <PartnerChips
          partnerIds={row.partnerIds}
          partners={partners}
          legacyPartner={row.partner}
        />
      ),
      editRender: (draft, setField) => (
        <PartnerMultiSelect
          partnerIds={draft.partnerIds}
          partners={partners}
          setField={setField}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <div className="status-cell">
          <span className={`badge badge-${row.status}`}>{row.status}</span>
          {row.stage && <span className="status-stage">{row.stage}</span>}
        </div>
      ),
      editRender: (draft, setField) => (
        <div className="status-edit">
          <select value={draft.status ?? ''} onChange={(e) => setField('status', e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <input
            placeholder="Stage (e.g. contracting)"
            value={draft.stage ?? ''}
            onChange={(e) => setField('stage', e.target.value)}
          />
        </div>
      ),
    },
    memberColumn('owner', 'Owner'),
    { key: 'poc', label: 'POC' },
    { key: 'startDate', label: 'Start', type: 'date' },
    { key: 'nextStep', label: 'Next Step' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ], [partners, memberNames])

  const partnerColumns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'kind', label: 'Kind', type: 'select', options: ['data provider', 'partner', 'vendor', 'client'] },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'prospect'] },
    memberColumn('owner', 'Owner'),
    {
      key: 'engagements',
      label: 'Engagements',
      render: (_, row) => (
        <EngagementChips partnerId={row.id} engagements={engagements} />
      ),
      editRender: () => (
        <span className="muted">Linked from Engagements tab</span>
      ),
    },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ], [engagements, memberNames])

  const agreementColumns = useMemo(() => [
    { key: 'partner', label: 'Partner' },
    {
      key: 'mndaSigned',
      label: 'MNDA',
      type: 'select',
      options: ['yes', 'no'],
      render: (val) => (
        <span className={`badge badge-${val === 'yes' ? 'active' : 'prospect'}`}>
          {val === 'yes' ? 'Signed' : 'No'}
        </span>
      ),
    },
    { key: 'mndaDate', label: 'MNDA Date', type: 'date' },
    { key: 'expiration', label: 'Expires', type: 'date' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    memberColumn('sender', 'Sender'),
    { key: 'others', label: 'Other Agreements', type: 'textarea' },
    { key: 'demo', label: 'Demo', type: 'textarea' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ], [memberNames])

  const partnerNamesFor = (row) => (row.partnerIds || [])
    .map((id) => partners.find((p) => p.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="page">
      <h1>Engagements</h1>
      <p className="subtitle">Track pilots, contracts, agreements, and supporting documents.</p>

      <div className="tabs">
        <button
          className={`tab ${tab === 'engagements' ? 'active' : ''}`}
          onClick={() => selectTab('engagements')}
        >
          Engagements ({engagements.length})
        </button>
        <button
          className={`tab ${tab === 'partners' ? 'active' : ''}`}
          onClick={() => selectTab('partners')}
        >
          Partners &amp; Data Providers ({partners.length})
        </button>
        <button
          className={`tab ${tab === 'agreements' ? 'active' : ''}`}
          onClick={() => selectTab('agreements')}
        >
          Agreement Tracker ({agreements.length})
        </button>
      </div>

      {tab === 'engagements' ? (
        <EditableTable
          rows={engagements}
          columns={engagementColumns}
          emptyRow={EMPTY_ENGAGEMENT}
          onSave={saveEngagement}
          onDelete={deleteEngagement}
          rowDetailParentType="engagement"
          rowDetail={(row) => (
            <div className="row-detail-panels">
              <MarkdownDoc
                compact
                title="Description"
                body={row.description || ''}
                onSave={(description) => saveEngagement({ ...row, description })}
              />
              <ActivityPanel parentType="engagement" parentId={row.id} />
              <AttachmentList
                parentType="engagement"
                parentId={row.id}
                title="Supporting Documents"
              />
            </div>
          )}
          filterFn={(row, q) => {
            const ql = q.toLowerCase()
            return [
              row.name,
              row.partner,
              row.owner,
              row.poc,
              row.status,
              row.stage,
              row.description,
              ...partnerNamesFor(row),
            ].some((v) => String(v).toLowerCase().includes(ql))
          }}
        />
      ) : tab === 'partners' ? (
        <EditableTable
          rows={partners}
          columns={partnerColumns}
          emptyRow={EMPTY_PARTNER}
          onSave={savePartner}
          onDelete={deletePartner}
          rowDetailParentType="partner"
          rowDetail={(row) => (
            <div className="row-detail-panels">
              <ActivityPanel parentType="partner" parentId={row.id} />
              <AttachmentList
                parentType="partner"
                parentId={row.id}
                title="Supporting Documents"
              />
            </div>
          )}
          filterFn={(row, q) => {
            const ql = q.toLowerCase()
            const linkedNames = engagements
              .filter((e) => e.partnerIds?.includes(row.id))
              .map((e) => e.name)
            return [row.name, row.kind, row.contact, row.status, row.owner, ...linkedNames]
              .some((v) => String(v).toLowerCase().includes(ql))
          }}
        />
      ) : (
        <EditableTable
          rows={agreements}
          columns={agreementColumns}
          emptyRow={EMPTY_AGREEMENT}
          onSave={saveAgreement}
          onDelete={deleteAgreement}
          filterFn={(row, q) =>
            [row.partner, row.contact, row.email, row.sender, row.mndaSigned, row.others].some((v) =>
              String(v).toLowerCase().includes(q.toLowerCase())
            )
          }
        />
      )}
    </div>
  )
}

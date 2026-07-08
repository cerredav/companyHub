import Dexie from 'dexie'
import {
  strategyDoc,
  homeDocs,
  processDocs,
  policies as seedPolicies,
  engagements as seedEngagements,
  partners as seedPartners,
  teamMembers as seedTeamMembers,
  legacyStrategyBody,
  isReservedSlug,
  topUpProcessDocs,
  meetings as seedMeetings,
  agreements as seedAgreements,
} from './seed.js'

// ponytail: single storage seam — swap this module for API calls when backend exists
export const db = new Dexie('companyHub')

db.version(1).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
})

db.version(2).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
})

db.version(3).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
  policies: 'id, name, updatedAt',
})

db.version(4).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
  policies: 'id, name, updatedAt',
  meetings: 'id, date, updatedAt',
})

db.version(5).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
  policies: 'id, name, updatedAt',
  meetings: 'id, date, updatedAt',
  buckets: 'id, team, updatedAt',
})

db.version(6).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
  policies: 'id, name, updatedAt',
  meetings: 'id, date, updatedAt',
  buckets: 'id, team, updatedAt',
  agreements: 'id, partner, updatedAt',
})

db.version(7).stores({
  documents: 'id, slug, title, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, name, kind, status, updatedAt',
  teamMembers: 'id, name, team, updatedAt',
  files: 'id, [parentType+parentId], updatedAt',
  policies: 'id, name, updatedAt',
  meetings: 'id, date, updatedAt',
  buckets: 'id, team, updatedAt',
  agreements: 'id, partner, updatedAt',
  activities: 'id, [parentType+parentId], createdAt',
})

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

function docSection(slug) {
  if (slug === 'strategy') return 'Strategy'
  if (slug === 'company-info' || slug === 'quick-links') return 'Home'
  if (slug.startsWith('team-')) return 'Teams'
  return 'Processes'
}

// --- Blob helpers for export/import ---

function normalizeBlob(value, mimeType) {
  if (value instanceof Blob) return value
  if (value instanceof ArrayBuffer) {
    return new Blob([value], { type: mimeType || 'application/octet-stream' })
  }
  return new Blob([value], { type: mimeType || 'application/octet-stream' })
}

function normalizeFile(record) {
  return { ...record, blob: normalizeBlob(record.blob, record.mimeType) }
}

async function blobToBase64(blob, mimeType = 'application/octet-stream') {
  const b = normalizeBlob(blob, mimeType)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(b)
  })
}

function base64ToBlob(base64, mimeType) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

// --- Documents (Strategy + Processes + Home cards) ---

export async function getDocumentBySlug(slug) {
  return db.documents.where('slug').equals(slug).first()
}

export async function listDocuments() {
  return db.documents.orderBy('title').toArray()
}

export async function listProcessDocuments() {
  const docs = await listDocuments()
  return docs.filter((d) => !isReservedSlug(d.slug))
}

export async function saveDocument({ id, slug, title, body }) {
  const record = {
    id: id || uid(),
    slug,
    title,
    body,
    updatedAt: now(),
  }
  await db.documents.put(record)
  return record
}

export async function deleteDocument(id) {
  await deleteFilesForParent('process', id)
  await db.documents.delete(id)
}

// --- Activity log (engagements + partners) ---

const ACTIVITY_PARENTS = new Set(['engagement', 'partner'])
const SKIP_DIFF_KEYS = new Set(['id', 'updatedAt'])

function displayVal(val) {
  if (val == null || val === '') return '—'
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
  return String(val)
}

async function partnerNamesForIds(ids) {
  if (!ids?.length) return '—'
  const partners = await db.partners.toArray()
  const byId = new Map(partners.map((p) => [p.id, p.name]))
  return ids.map((id) => byId.get(id) || id).join(', ') || '—'
}

async function normalizeForDiff(record, parentType) {
  if (!record) return null
  const copy = { ...record }
  if (parentType === 'engagement' && copy.partnerIds) {
    copy.partnerIds = await partnerNamesForIds(copy.partnerIds)
  }
  return copy
}

async function diffRecord(parentType, prev, next) {
  const [a, b] = await Promise.all([
    normalizeForDiff(prev, parentType),
    normalizeForDiff(next, parentType),
  ])
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  const parts = []

  for (const key of keys) {
    if (SKIP_DIFF_KEYS.has(key)) continue
    const oldVal = displayVal(a?.[key])
    const newVal = displayVal(b?.[key])
    if (oldVal !== newVal) parts.push(`${key}: ${oldVal} → ${newVal}`)
  }

  return parts.join(' · ')
}

export async function listActivities(parentType, parentId) {
  const items = await db.activities
    .where('[parentType+parentId]')
    .equals([parentType, parentId])
    .toArray()
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addActivity({ parentType, parentId, kind, text, author = '', createdAt }) {
  const record = {
    id: uid(),
    parentType,
    parentId,
    kind,
    text,
    author,
    createdAt: createdAt || now(),
  }
  await db.activities.add(record)
  return record
}

export async function deleteActivity(id) {
  await db.activities.delete(id)
}

/** Update a manual note — kind/parent fields are immutable */
export async function saveActivity({ id, text, author = '', createdAt }) {
  const existing = await db.activities.get(id)
  if (!existing || existing.kind !== 'note') {
    throw new Error('Only manual notes can be edited')
  }
  const record = {
    ...existing,
    text,
    author,
    createdAt: createdAt || existing.createdAt,
  }
  await db.activities.put(record)
  return record
}

async function deleteActivitiesForParent(parentType, parentId) {
  const items = await listActivities(parentType, parentId)
  await db.activities.bulkDelete(items.map((a) => a.id))
}

async function logChangeIfNeeded(parentType, parentId, prev, next) {
  const text = await diffRecord(parentType, prev, next)
  if (!text) return
  await addActivity({ parentType, parentId, kind: 'change', text })
}

// --- Engagements ---

export async function listEngagements() {
  return db.engagements.orderBy('updatedAt').reverse().toArray()
}

export async function saveEngagement(data, { logActivity = true } = {}) {
  const prev = data.id ? await db.engagements.get(data.id) : null
  const record = {
    ...data,
    id: data.id || uid(),
    partnerIds: data.partnerIds ?? [],
    updatedAt: now(),
  }
  await db.engagements.put(record)
  if (logActivity && prev) {
    await logChangeIfNeeded('engagement', record.id, prev, record)
  }
  return record
}

export async function deleteEngagement(id) {
  await deleteFilesForParent('engagement', id)
  await deleteActivitiesForParent('engagement', id)
  await stripMeetingLinks('engagement', id)
  await db.engagements.delete(id)
}

// --- Partners ---

export async function listPartners() {
  return db.partners.orderBy('name').toArray()
}

export async function savePartner(data, { logActivity = true } = {}) {
  const prev = data.id ? await db.partners.get(data.id) : null
  const record = { owner: '', ...data, id: data.id || uid(), updatedAt: now() }
  await db.partners.put(record)
  if (logActivity && prev) {
    await logChangeIfNeeded('partner', record.id, prev, record)
  }
  return record
}

export async function deletePartner(id) {
  await deleteFilesForParent('partner', id)
  await deleteActivitiesForParent('partner', id)
  const engagements = await db.engagements.toArray()
  for (const eng of engagements) {
    if (!eng.partnerIds?.includes(id)) continue
    await saveEngagement({
      ...eng,
      partnerIds: eng.partnerIds.filter((pid) => pid !== id),
    }, { logActivity: false })
  }
  await stripMeetingLinks('partner', id)
  await db.partners.delete(id)
}

/** One-shot: link legacy engagement.partner text to partner records by name */
export async function linkEngagementsByName() {
  const [engagements, partners] = await Promise.all([
    db.engagements.toArray(),
    db.partners.toArray(),
  ])
  const byName = new Map(partners.map((p) => [p.name.trim().toLowerCase(), p.id]))
  let updated = 0

  for (const eng of engagements) {
    if (eng.partnerIds?.length) continue
    const text = (eng.partner || '').trim()
    if (!text) continue
    const partnerId = byName.get(text.toLowerCase())
    if (!partnerId) continue
    await saveEngagement({ ...eng, partnerIds: [partnerId] }, { logActivity: false })
    updated++
  }

  return updated
}

// --- Team members ---

export async function listTeamMembers() {
  return db.teamMembers.orderBy('name').toArray()
}

export async function saveTeamMember(data) {
  const record = {
    location: '',
    timezone: '',
    ...data,
    id: data.id || uid(),
    updatedAt: now(),
  }
  await db.teamMembers.put(record)
  return record
}

export async function deleteTeamMember(id) {
  await db.teamMembers.delete(id)
}

// --- Policies ---

function formatPolicyDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function policyLastActivityAt(policy, files = []) {
  let latest = policy.updatedAt || ''
  for (const f of files) {
    if (f.updatedAt > latest) latest = f.updatedAt
  }
  return latest
}

export async function listPolicies() {
  const [policies, policyFiles] = await Promise.all([
    db.policies.orderBy('name').toArray(),
    db.files.where('parentType').equals('policy').toArray(),
  ])
  const filesByPolicy = new Map()
  for (const f of policyFiles) {
    const list = filesByPolicy.get(f.parentId) || []
    list.push(f)
    filesByPolicy.set(f.parentId, list)
  }
  return policies.map((p) => ({
    ...p,
    lastUpdated: formatPolicyDate(policyLastActivityAt(p, filesByPolicy.get(p.id) || [])),
  }))
}

export async function savePolicy(data) {
  const { link: _link, lastUpdated: _lastUpdated, ...rest } = data
  const record = { ...rest, id: data.id || uid(), updatedAt: now() }
  await db.policies.put(record)
  return record
}

export async function deletePolicy(id) {
  await deleteFilesForParent('policy', id)
  await db.policies.delete(id)
}

// --- Meetings (Granola summaries) ---

export async function listMeetings() {
  return db.meetings.orderBy('date').reverse().toArray()
}

export async function saveMeeting(data) {
  const record = {
    ...data,
    id: data.id || uid(),
    engagementIds: data.engagementIds ?? [],
    partnerIds: data.partnerIds ?? [],
    updatedAt: now(),
  }
  await db.meetings.put(record)
  return record
}

export async function deleteMeeting(id) {
  await db.meetings.delete(id)
}

const MEETING_LINK_KEY = { engagement: 'engagementIds', partner: 'partnerIds' }

async function stripMeetingLinks(parentType, parentId) {
  const key = MEETING_LINK_KEY[parentType]
  const meetings = await db.meetings.toArray()
  for (const m of meetings) {
    if (!m[key]?.includes(parentId)) continue
    await saveMeeting({ ...m, [key]: m[key].filter((id) => id !== parentId) })
  }
}

export async function listMeetingsFor(parentType, parentId) {
  const key = MEETING_LINK_KEY[parentType]
  const meetings = await db.meetings.toArray()
  return meetings
    .filter((m) => m[key]?.includes(parentId))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function countMeetingsFor(parentType, parentId) {
  const key = MEETING_LINK_KEY[parentType]
  const meetings = await db.meetings.toArray()
  return meetings.filter((m) => m[key]?.includes(parentId)).length
}

export async function linkMeeting(meetingId, parentType, parentId) {
  const meeting = await db.meetings.get(meetingId)
  if (!meeting) throw new Error('Meeting not found')
  const key = MEETING_LINK_KEY[parentType]
  const ids = meeting[key] ?? []
  if (ids.includes(parentId)) return meeting
  return saveMeeting({ ...meeting, [key]: [...ids, parentId] })
}

export async function unlinkMeeting(meetingId, parentType, parentId) {
  const meeting = await db.meetings.get(meetingId)
  if (!meeting) return null
  const key = MEETING_LINK_KEY[parentType]
  return saveMeeting({
    ...meeting,
    [key]: (meeting[key] ?? []).filter((id) => id !== parentId),
  })
}

// --- Agreements (MNDA / partner agreement tracker) ---

export async function listAgreements() {
  return db.agreements.orderBy('partner').toArray()
}

export async function saveAgreement(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.agreements.put(record)
  return record
}

export async function deleteAgreement(id) {
  await db.agreements.delete(id)
}

// --- Team buckets (sections holding notes, links, documents) ---
// record: { id, team, name, notes (markdown), links: [{label, url}], updatedAt }

export async function listBuckets(team) {
  return db.buckets.where('team').equals(team).sortBy('name')
}

export async function saveBucket(data) {
  const record = { links: [], notes: '', ...data, id: data.id || uid(), updatedAt: now() }
  await db.buckets.put(record)
  return record
}

export async function deleteBucket(id) {
  await deleteFilesForParent('bucket', id)
  await db.buckets.delete(id)
}

// --- File attachments ---

export async function listFiles(parentType, parentId) {
  const files = await db.files
    .where('[parentType+parentId]')
    .equals([parentType, parentId])
    .toArray()
  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(normalizeFile)
}

export async function countFiles(parentType, parentId) {
  return db.files
    .where('[parentType+parentId]')
    .equals([parentType, parentId])
    .count()
}

export async function countActivities(parentType, parentId) {
  return db.activities
    .where('[parentType+parentId]')
    .equals([parentType, parentId])
    .count()
}

async function fileToBuffer(file) {
  if (typeof file.arrayBuffer === 'function') return file.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export async function addFile(parentType, parentId, file) {
  const buffer = await fileToBuffer(file)
  const record = {
    id: uid(),
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    blob: buffer,
    parentType,
    parentId,
    updatedAt: now(),
  }
  await db.files.add(record)
  if (parentType === 'policy') {
    await db.policies.update(parentId, { updatedAt: now() })
  }
  if (ACTIVITY_PARENTS.has(parentType)) {
    await addActivity({
      parentType,
      parentId,
      kind: 'file',
      text: `Uploaded "${file.name}"`,
    })
  }
  return normalizeFile(record)
}

export async function deleteFile(id) {
  await db.files.delete(id)
}

async function deleteFilesForParent(parentType, parentId) {
  const files = await listFiles(parentType, parentId)
  await db.files.bulkDelete(files.map((f) => f.id))
}

export function downloadFile(record) {
  const blob = normalizeBlob(record.blob, record.mimeType)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = record.name
  a.click()
  URL.revokeObjectURL(url)
}

// --- Dashboard helpers ---

export async function getCounts() {
  const [documents, engagements, partners, teamMembers, files, policies, meetings, agreements] = await Promise.all([
    db.documents.count(),
    db.engagements.count(),
    db.partners.count(),
    db.teamMembers.count(),
    db.files.count(),
    db.policies.count(),
    db.meetings.count(),
    db.agreements.count(),
  ])
  const processDocs = (await listProcessDocuments()).length
  return { documents, processDocs, engagements, partners, teamMembers, files, policies, meetings, agreements }
}

export async function getRecentUpdates(limit = 10) {
  const [documents, engagements, partners, teamMembers, files, policies, meetings] = await Promise.all([
    db.documents.toArray(),
    db.engagements.toArray(),
    db.partners.toArray(),
    db.teamMembers.toArray(),
    db.files.toArray(),
    db.policies.toArray(),
    db.meetings.toArray(),
  ])

  const items = [
    ...documents.map((d) => ({
      id: d.id,
      label: d.title,
      section: docSection(d.slug),
      updatedAt: d.updatedAt,
    })),
    ...engagements.map((e) => ({
      id: e.id,
      label: e.name,
      section: 'Engagements',
      updatedAt: e.updatedAt,
    })),
    ...partners.map((p) => ({
      id: p.id,
      label: p.name,
      section: 'Partners',
      updatedAt: p.updatedAt,
    })),
    ...teamMembers.map((m) => ({
      id: m.id,
      label: m.name,
      section: 'Teams',
      updatedAt: m.updatedAt,
    })),
    ...policies.map((p) => ({
      id: p.id,
      label: p.name,
      section: 'Policies',
      updatedAt: p.updatedAt,
    })),
    ...meetings.map((m) => ({
      id: m.id,
      label: m.title,
      section: 'Meetings',
      updatedAt: m.updatedAt,
    })),
    ...files.map((f) => ({
      id: f.id,
      label: f.name,
      section: 'Files',
      updatedAt: f.updatedAt,
    })),
  ]

  return items
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}

// --- Export / Import ---

export async function exportAll() {
  const [documents, engagements, partners, teamMembers, files, policies, meetings, buckets, agreements, activities] = await Promise.all([
    db.documents.toArray(),
    db.engagements.toArray(),
    db.partners.toArray(),
    db.teamMembers.toArray(),
    db.files.toArray(),
    db.policies.toArray(),
    db.meetings.toArray(),
    db.buckets.toArray(),
    db.agreements.toArray(),
    db.activities.toArray(),
  ])

  const serializedFiles = await Promise.all(
    files.map(async (f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      parentType: f.parentType,
      parentId: f.parentId,
      updatedAt: f.updatedAt,
      dataBase64: await blobToBase64(f.blob, f.mimeType),
    }))
  )

  return {
    version: 2,
    exportedAt: now(),
    documents,
    engagements,
    partners,
    teamMembers,
    policies,
    meetings,
    buckets,
    agreements,
    activities,
    files: serializedFiles,
  }
}

export async function importAll(data) {
  if (!data || (data.version !== 1 && data.version !== 2)) {
    throw new Error('Invalid export file: expected version 1 or 2')
  }

  const fileRecords = data.version === 2 && data.files?.length
    ? await Promise.all(
        data.files.map(async (f) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: f.size,
          parentType: f.parentType,
          parentId: f.parentId,
          updatedAt: f.updatedAt,
          blob: await fileToBuffer(base64ToBlob(f.dataBase64, f.mimeType)),
        }))
      )
    : []

  const tables = [db.documents, db.engagements, db.partners, db.teamMembers, db.files, db.policies, db.meetings, db.buckets, db.agreements, db.activities]

  await db.transaction('rw', ...tables, async () => {
    await Promise.all(tables.map((t) => t.clear()))

    await db.documents.bulkPut(data.documents || [])
    await db.engagements.bulkPut(data.engagements || [])
    await db.partners.bulkPut(data.partners || [])
    await db.teamMembers.bulkPut(data.teamMembers || [])
    await db.policies.bulkPut(data.policies || [])
    await db.meetings.bulkPut(data.meetings || [])
    await db.buckets.bulkPut(data.buckets || [])
    await db.agreements.bulkPut(data.agreements || [])
    await db.activities.bulkPut(data.activities || [])
    if (fileRecords.length) await db.files.bulkPut(fileRecords)
  })
}

// --- Seeding ---

const SEED_KEY = 'companyHubSeeded'
const TOPUP_KEY = 'companyHubTopUpV6'
const TOPUP_V3_KEY = 'companyHubTopUpV3'
const TOPUP_V4_KEY = 'companyHubTopUpV4'
const TOPUP_V5_KEY = 'companyHubTopUpV5'
const LINK_V7_KEY = 'companyHubLinkV7'
const AGREEMENT_LINK_V8_KEY = 'companyHubAgreementLinkV8'
const AGREEMENT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1RmbSPj0g_Fk5fkl9RujUcFRyDZB0Vku3KwIz7uZRxWc/edit'
const AGREEMENT_TAB_LINK = '#engagements/agreements'

export async function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return

  const counts = await getCounts()
  if (counts.documents + counts.engagements + counts.partners + counts.teamMembers > 0) {
    localStorage.setItem(SEED_KEY, '1')
    return
  }

  const ts = now()

  await db.transaction(
    'rw',
    db.documents,
    db.engagements,
    db.partners,
    db.teamMembers,
    db.policies,
    db.meetings,
    db.agreements,
    async () => {
      await db.documents.bulkAdd([
        { id: uid(), ...strategyDoc, updatedAt: ts },
        ...homeDocs.map((d) => ({ id: uid(), ...d, updatedAt: ts })),
        ...processDocs.map((d) => ({ id: uid(), ...d, updatedAt: ts })),
      ])

      await db.engagements.bulkAdd(
        seedEngagements.map((e) => ({ id: uid(), ...e, updatedAt: ts }))
      )

      await db.partners.bulkAdd(
        seedPartners.map((p) => ({ id: uid(), ...p, updatedAt: ts }))
      )

      await db.teamMembers.bulkAdd(
        seedTeamMembers.map((m) => ({ id: uid(), ...m, updatedAt: ts }))
      )

      await db.policies.bulkAdd(
        seedPolicies.map((p) => ({ id: uid(), ...p, updatedAt: ts }))
      )

      await db.meetings.bulkAdd(
        seedMeetings.map((m) => ({ id: uid(), ...m, updatedAt: ts }))
      )

      await db.agreements.bulkAdd(
        seedAgreements.map((a) => ({ id: uid(), ...a, updatedAt: ts }))
      )
    }
  )

  localStorage.setItem(SEED_KEY, '1')
  localStorage.setItem(TOPUP_KEY, '1')
  localStorage.setItem(TOPUP_V3_KEY, '1')
  localStorage.setItem(TOPUP_V4_KEY, '1')
  localStorage.setItem(TOPUP_V5_KEY, '1')

  await linkEngagementsByName()
  localStorage.setItem(LINK_V7_KEY, '1')
}

/** One-shot: link legacy partner text on existing installs */
export async function migratePartnerLinks() {
  if (localStorage.getItem(LINK_V7_KEY)) return
  await linkEngagementsByName()
  localStorage.setItem(LINK_V7_KEY, '1')
}

/** One-shot: point Agreement Dashboard links at Engagements → Agreement Tracker tab */
export async function migrateAgreementDashboardLinks() {
  if (localStorage.getItem(AGREEMENT_LINK_V8_KEY)) return

  const docs = await db.documents.toArray()
  for (const doc of docs) {
    if (!doc.body?.includes(AGREEMENT_SHEET_URL)) continue
    await saveDocument({
      ...doc,
      body: doc.body.replaceAll(AGREEMENT_SHEET_URL, AGREEMENT_TAB_LINK),
    })
  }

  localStorage.setItem(AGREEMENT_LINK_V8_KEY, '1')
}

/** One-shot top-up for existing installs — never overwrites user edits */
export async function seedNewContent() {
  if (localStorage.getItem(TOPUP_KEY)) return

  const ts = now()

  // v3 top-up (policies, home cards, strategy) — run once if not done
  if (!localStorage.getItem(TOPUP_V3_KEY)) {
    if ((await db.policies.count()) === 0) {
      await db.policies.bulkAdd(
        seedPolicies.map((p) => ({ id: uid(), ...p, updatedAt: ts }))
      )
    }

    for (const doc of homeDocs) {
      const existing = await getDocumentBySlug(doc.slug)
      if (!existing) {
        await saveDocument({ ...doc, updatedAt: ts })
      }
    }

    const strategy = await getDocumentBySlug('strategy')
    if (strategy && strategy.body === legacyStrategyBody) {
      await saveDocument({ ...strategy, body: strategyDoc.body })
    }

    localStorage.setItem(TOPUP_V3_KEY, '1')
  }

  // v4 top-up — new process docs only if slug missing
  if (!localStorage.getItem(TOPUP_V4_KEY)) {
    for (const doc of topUpProcessDocs) {
      const existing = await getDocumentBySlug(doc.slug)
      if (!existing) {
        await saveDocument({ ...doc, updatedAt: ts })
      }
    }
    localStorage.setItem(TOPUP_V4_KEY, '1')
  }

  // v5 top-up — seed meetings if table empty
  if (!localStorage.getItem(TOPUP_V5_KEY)) {
    if ((await db.meetings.count()) === 0) {
      await db.meetings.bulkAdd(
        seedMeetings.map((m) => ({ id: uid(), ...m, updatedAt: ts }))
      )
    }
    localStorage.setItem(TOPUP_V5_KEY, '1')
  }

  // v6 top-up — seed agreements if table empty
  if ((await db.agreements.count()) === 0) {
    await db.agreements.bulkAdd(
      seedAgreements.map((a) => ({ id: uid(), ...a, updatedAt: ts }))
    )
  }

  localStorage.setItem(TOPUP_KEY, '1')
}

/** Test helper — wipe all tables */
export async function clearAll() {
  await db.transaction(
    'rw',
    db.documents,
    db.engagements,
    db.partners,
    db.teamMembers,
    db.files,
    db.policies,
    db.meetings,
    db.buckets,
    db.agreements,
    db.activities,
    async () => {
      await Promise.all([
        db.documents.clear(),
        db.engagements.clear(),
        db.partners.clear(),
        db.teamMembers.clear(),
        db.files.clear(),
        db.policies.clear(),
        db.meetings.clear(),
        db.buckets.clear(),
        db.agreements.clear(),
        db.activities.clear(),
      ])
    }
  )
  localStorage.removeItem(SEED_KEY)
  localStorage.removeItem(TOPUP_KEY)
  localStorage.removeItem(TOPUP_V3_KEY)
  localStorage.removeItem(TOPUP_V4_KEY)
  localStorage.removeItem(TOPUP_V5_KEY)
  localStorage.removeItem(LINK_V7_KEY)
  localStorage.removeItem(AGREEMENT_LINK_V8_KEY)
}

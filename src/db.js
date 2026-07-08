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

// --- Engagements ---

export async function listEngagements() {
  return db.engagements.orderBy('updatedAt').reverse().toArray()
}

export async function saveEngagement(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.engagements.put(record)
  return record
}

export async function deleteEngagement(id) {
  await deleteFilesForParent('engagement', id)
  await db.engagements.delete(id)
}

// --- Partners ---

export async function listPartners() {
  return db.partners.orderBy('name').toArray()
}

export async function savePartner(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.partners.put(record)
  return record
}

export async function deletePartner(id) {
  await db.partners.delete(id)
}

// --- Team members ---

export async function listTeamMembers() {
  return db.teamMembers.orderBy('name').toArray()
}

export async function saveTeamMember(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.teamMembers.put(record)
  return record
}

export async function deleteTeamMember(id) {
  await db.teamMembers.delete(id)
}

// --- Policies ---

export async function listPolicies() {
  return db.policies.orderBy('name').toArray()
}

export async function savePolicy(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.policies.put(record)
  return record
}

export async function deletePolicy(id) {
  await db.policies.delete(id)
}

// --- Meetings (Granola summaries) ---

export async function listMeetings() {
  return db.meetings.orderBy('date').reverse().toArray()
}

export async function saveMeeting(data) {
  const record = { ...data, id: data.id || uid(), updatedAt: now() }
  await db.meetings.put(record)
  return record
}

export async function deleteMeeting(id) {
  await db.meetings.delete(id)
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
  const [documents, engagements, partners, teamMembers, files, policies, meetings] = await Promise.all([
    db.documents.count(),
    db.engagements.count(),
    db.partners.count(),
    db.teamMembers.count(),
    db.files.count(),
    db.policies.count(),
    db.meetings.count(),
  ])
  const processDocs = (await listProcessDocuments()).length
  return { documents, processDocs, engagements, partners, teamMembers, files, policies, meetings }
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
  const [documents, engagements, partners, teamMembers, files, policies, meetings] = await Promise.all([
    db.documents.toArray(),
    db.engagements.toArray(),
    db.partners.toArray(),
    db.teamMembers.toArray(),
    db.files.toArray(),
    db.policies.toArray(),
    db.meetings.toArray(),
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

  const tables = [db.documents, db.engagements, db.partners, db.teamMembers, db.files, db.policies, db.meetings]

  await db.transaction('rw', ...tables, async () => {
    await Promise.all(tables.map((t) => t.clear()))

    await db.documents.bulkPut(data.documents || [])
    await db.engagements.bulkPut(data.engagements || [])
    await db.partners.bulkPut(data.partners || [])
    await db.teamMembers.bulkPut(data.teamMembers || [])
    await db.policies.bulkPut(data.policies || [])
    await db.meetings.bulkPut(data.meetings || [])
    if (fileRecords.length) await db.files.bulkPut(fileRecords)
  })
}

// --- Seeding ---

const SEED_KEY = 'companyHubSeeded'
const TOPUP_KEY = 'companyHubTopUpV5'
const TOPUP_V3_KEY = 'companyHubTopUpV3'
const TOPUP_V4_KEY = 'companyHubTopUpV4'

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
    }
  )

  localStorage.setItem(SEED_KEY, '1')
  localStorage.setItem(TOPUP_KEY, '1')
  localStorage.setItem(TOPUP_V3_KEY, '1')
  localStorage.setItem(TOPUP_V4_KEY, '1')
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
  if ((await db.meetings.count()) === 0) {
    await db.meetings.bulkAdd(
      seedMeetings.map((m) => ({ id: uid(), ...m, updatedAt: ts }))
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
    async () => {
      await Promise.all([
        db.documents.clear(),
        db.engagements.clear(),
        db.partners.clear(),
        db.teamMembers.clear(),
        db.files.clear(),
        db.policies.clear(),
        db.meetings.clear(),
      ])
    }
  )
  localStorage.removeItem(SEED_KEY)
  localStorage.removeItem(TOPUP_KEY)
  localStorage.removeItem(TOPUP_V3_KEY)
}

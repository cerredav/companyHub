import Dexie from 'dexie'

// ponytail: single storage seam — swap this module for API calls when backend exists
export const db = new Dexie('companyHub')

db.version(1).stores({
  documents: 'id, slug, updatedAt',
  engagements: 'id, status, owner, updatedAt',
  partners: 'id, kind, status, updatedAt',
  teamMembers: 'id, team, updatedAt',
})

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

// --- Documents (Strategy + Processes) ---

export async function getDocumentBySlug(slug) {
  return db.documents.where('slug').equals(slug).first()
}

export async function listDocuments() {
  return db.documents.orderBy('title').toArray()
}

export async function listProcessDocuments() {
  const docs = await listDocuments()
  return docs.filter((d) => d.slug !== 'strategy')
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

// --- Dashboard helpers ---

export async function getCounts() {
  const [documents, engagements, partners, teamMembers] = await Promise.all([
    db.documents.count(),
    db.engagements.count(),
    db.partners.count(),
    db.teamMembers.count(),
  ])
  const processDocs = (await listProcessDocuments()).length
  return { documents, processDocs, engagements, partners, teamMembers }
}

export async function getRecentUpdates(limit = 10) {
  const [documents, engagements, partners, teamMembers] = await Promise.all([
    db.documents.toArray(),
    db.engagements.toArray(),
    db.partners.toArray(),
    db.teamMembers.toArray(),
  ])

  const items = [
    ...documents.map((d) => ({
      id: d.id,
      label: d.title,
      section: d.slug === 'strategy' ? 'Strategy' : 'Processes',
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
  ]

  return items
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
}

// --- Export / Import ---

export async function exportAll() {
  const [documents, engagements, partners, teamMembers] = await Promise.all([
    db.documents.toArray(),
    db.engagements.toArray(),
    db.partners.toArray(),
    db.teamMembers.toArray(),
  ])
  return {
    version: 1,
    exportedAt: now(),
    documents,
    engagements,
    partners,
    teamMembers,
  }
}

export async function importAll(data) {
  if (!data || data.version !== 1) {
    throw new Error('Invalid export file: expected version 1')
  }
  await db.transaction('rw', db.documents, db.engagements, db.partners, db.teamMembers, async () => {
    await Promise.all([
      db.documents.clear(),
      db.engagements.clear(),
      db.partners.clear(),
      db.teamMembers.clear(),
    ])
    await db.documents.bulkPut(data.documents || [])
    await db.engagements.bulkPut(data.engagements || [])
    await db.partners.bulkPut(data.partners || [])
    await db.teamMembers.bulkPut(data.teamMembers || [])
  })
}

// --- First-run seed ---

const SEED_KEY = 'companyHubSeeded'

export async function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return

  const counts = await getCounts()
  if (counts.documents + counts.engagements + counts.partners + counts.teamMembers > 0) {
    localStorage.setItem(SEED_KEY, '1')
    return
  }

  await db.transaction('rw', db.documents, db.engagements, db.partners, db.teamMembers, async () => {
    await db.documents.bulkAdd([
      {
        id: uid(),
        slug: 'strategy',
        title: 'Company Strategy',
        body: '# Strategy\n\nDescribe your company direction, priorities, and goals here.\n',
        updatedAt: now(),
      },
      {
        id: uid(),
        slug: 'onboarding',
        title: 'New Hire Onboarding',
        body: '# Onboarding\n\n1. Set up accounts\n2. Meet the team\n3. Review active engagements\n',
        updatedAt: now(),
      },
    ])

    await db.engagements.bulkAdd([
      {
        id: uid(),
        name: 'Example Pilot — Acme Corp',
        type: 'pilot',
        partner: 'Acme Corp',
        status: 'active',
        stage: 'discovery',
        owner: 'TBD',
        startDate: '',
        nextStep: 'Schedule kickoff',
        notes: '',
        updatedAt: now(),
      },
    ])

    await db.partners.bulkAdd([
      {
        id: uid(),
        name: 'Example Data Provider',
        kind: 'data provider',
        contact: '',
        status: 'active',
        notes: '',
        updatedAt: now(),
      },
    ])

    await db.teamMembers.bulkAdd([
      {
        id: uid(),
        name: 'Example Member',
        role: 'Engineer',
        team: 'Engineering',
        email: '',
        notes: '',
        updatedAt: now(),
      },
    ])
  })

  localStorage.setItem(SEED_KEY, '1')
}

/** Test helper — wipe all tables */
export async function clearAll() {
  await db.transaction('rw', db.documents, db.engagements, db.partners, db.teamMembers, async () => {
    await Promise.all([
      db.documents.clear(),
      db.engagements.clear(),
      db.partners.clear(),
      db.teamMembers.clear(),
    ])
  })
  localStorage.removeItem(SEED_KEY)
}

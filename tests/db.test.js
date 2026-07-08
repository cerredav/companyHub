import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearAll,
  saveDocument,
  deleteDocument,
  getDocumentBySlug,
  listProcessDocuments,
  saveEngagement,
  listEngagements,
  deleteEngagement,
  savePartner,
  listPartners,
  saveTeamMember,
  listTeamMembers,
  savePolicy,
  listPolicies,
  deletePolicy,
  addFile,
  listFiles,
  deleteFile,
  getCounts,
  exportAll,
  importAll,
} from '../src/db.js'

beforeEach(async () => {
  await clearAll()
})

describe('documents', () => {
  it('saves and retrieves by slug', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: '# Hello' })
    const doc = await getDocumentBySlug('strategy')
    expect(doc.title).toBe('Strategy')
    expect(doc.body).toBe('# Hello')
    expect(doc.updatedAt).toBeTruthy()
  })

  it('lists process docs excluding reserved slugs', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: '' })
    await saveDocument({ slug: 'company-info', title: 'Company', body: '' })
    await saveDocument({ slug: 'quick-links', title: 'Links', body: '' })
    await saveDocument({ slug: 'onboarding', title: 'Onboarding', body: '' })
    const processes = await listProcessDocuments()
    expect(processes).toHaveLength(1)
    expect(processes[0].slug).toBe('onboarding')
  })

  it('cascade-deletes process attachments', async () => {
    const doc = await saveDocument({ slug: 'p1', title: 'P1', body: '' })
    const blob = new Blob(['hello'], { type: 'text/plain' })
    const file = new File([blob], 'note.txt', { type: 'text/plain' })
    await addFile('process', doc.id, file)
    await deleteDocument(doc.id)
    expect(await listFiles('process', doc.id)).toHaveLength(0)
  })
})

describe('policies', () => {
  it('creates, lists, and deletes', async () => {
    const saved = await savePolicy({
      name: 'Travel Policy',
      lastUpdated: '21 Apr 2026',
      link: 'https://example.com/travel',
      notes: '',
    })
    const list = await listPolicies()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Travel Policy')

    await deletePolicy(saved.id)
    expect(await listPolicies()).toHaveLength(0)
  })
})

describe('engagements', () => {
  it('creates, lists, and deletes with POC fields', async () => {
    const saved = await saveEngagement({
      name: 'Pilot A', type: 'pilot', status: 'active',
      partner: 'Acme', stage: '', owner: '', poc: 'Jane', pocContact: 'jane@acme.com',
      startDate: '', nextStep: '', notes: '',
    })
    const list = await listEngagements()
    expect(list).toHaveLength(1)
    expect(list[0].poc).toBe('Jane')
    expect(list[0].pocContact).toBe('jane@acme.com')

    await deleteEngagement(saved.id)
    expect(await listEngagements()).toHaveLength(0)
  })

  it('cascade-deletes engagement attachments', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const file = new File([new Blob(['x'])], 'deck.pdf', { type: 'application/pdf' })
    await addFile('engagement', eng.id, file)
    await deleteEngagement(eng.id)
    expect(await listFiles('engagement', eng.id)).toHaveLength(0)
  })
})

describe('files', () => {
  it('adds, lists, and deletes files', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const file = new File([new Blob(['content'])], 'doc.txt', { type: 'text/plain' })
    const saved = await addFile('engagement', eng.id, file)
    const list = await listFiles('engagement', eng.id)
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('doc.txt')
    expect(list[0].size).toBe(7)

    await deleteFile(saved.id)
    expect(await listFiles('engagement', eng.id)).toHaveLength(0)
  })
})

describe('partners', () => {
  it('creates and lists', async () => {
    await savePartner({ name: 'DataCo', kind: 'data provider', contact: '', status: 'active', notes: '' })
    const list = await listPartners()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('DataCo')
  })
})

describe('team members', () => {
  it('creates and lists', async () => {
    await saveTeamMember({ name: 'Alex', role: 'Eng', team: 'Core', email: '', notes: '' })
    const list = await listTeamMembers()
    expect(list).toHaveLength(1)
    expect(list[0].team).toBe('Core')
  })
})

describe('export / import', () => {
  it('round-trips v2 with files and policies', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: 'body' })
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await savePartner({ name: 'P1', kind: 'partner', contact: '', status: 'active', notes: '' })
    await saveTeamMember({ name: 'T1', role: '', team: '', email: '', notes: '' })
    await savePolicy({ name: 'Handbook', lastUpdated: '2026', link: 'https://x.com', notes: '' })
    const file = new File([new Blob(['attach'])], 'a.txt', { type: 'text/plain' })
    await addFile('engagement', eng.id, file)

    const exported = await exportAll()
    expect(exported.version).toBe(2)
    expect(exported.files).toHaveLength(1)
    expect(exported.policies).toHaveLength(1)

    await clearAll()
    await importAll(exported)
    const counts = await getCounts()
    expect(counts.documents).toBe(1)
    expect(counts.engagements).toBe(1)
    expect(counts.partners).toBe(1)
    expect(counts.teamMembers).toBe(1)
    expect(counts.files).toBe(1)
    expect(counts.policies).toBe(1)
  })

  it('imports v1 exports without files or policies', async () => {
    const v1 = {
      version: 1,
      documents: [{ id: 'd1', slug: 'strategy', title: 'S', body: '', updatedAt: '2026-01-01' }],
      engagements: [],
      partners: [],
      teamMembers: [],
    }
    await importAll(v1)
    const counts = await getCounts()
    expect(counts.documents).toBe(1)
    expect(counts.files).toBe(0)
    expect(counts.policies).toBe(0)
  })

  it('imports v2 exports without policies array', async () => {
    const v2 = {
      version: 2,
      documents: [{ id: 'd1', slug: 'strategy', title: 'S', body: '', updatedAt: '2026-01-01' }],
      engagements: [],
      partners: [],
      teamMembers: [],
      files: [],
    }
    await importAll(v2)
    expect((await getCounts()).policies).toBe(0)
  })

  it('rejects invalid export version', async () => {
    await expect(importAll({ version: 99 })).rejects.toThrow('Invalid export file')
  })
})

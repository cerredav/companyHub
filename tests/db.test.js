import { describe, it, expect, beforeEach } from 'vitest'
import {
  db,
  clearAll,
  saveDocument,
  getDocumentBySlug,
  listProcessDocuments,
  saveEngagement,
  listEngagements,
  deleteEngagement,
  savePartner,
  listPartners,
  saveTeamMember,
  listTeamMembers,
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

  it('lists process docs excluding strategy', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: '' })
    await saveDocument({ slug: 'onboarding', title: 'Onboarding', body: '' })
    const processes = await listProcessDocuments()
    expect(processes).toHaveLength(1)
    expect(processes[0].slug).toBe('onboarding')
  })
})

describe('engagements', () => {
  it('creates, lists, and deletes', async () => {
    const saved = await saveEngagement({
      name: 'Pilot A', type: 'pilot', status: 'active',
      partner: 'Acme', stage: '', owner: '', startDate: '', nextStep: '', notes: '',
    })
    const list = await listEngagements()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Pilot A')

    await deleteEngagement(saved.id)
    expect(await listEngagements()).toHaveLength(0)
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
  it('round-trips all tables', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: 'body' })
    await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', stage: '', owner: '', startDate: '', nextStep: '', notes: '',
    })
    await savePartner({ name: 'P1', kind: 'partner', contact: '', status: 'active', notes: '' })
    await saveTeamMember({ name: 'T1', role: '', team: '', email: '', notes: '' })

    const exported = await exportAll()
    expect(exported.version).toBe(1)
    expect(exported.documents).toHaveLength(1)
    expect(exported.engagements).toHaveLength(1)
    expect(exported.partners).toHaveLength(1)
    expect(exported.teamMembers).toHaveLength(1)

    await clearAll()
    expect((await getCounts()).engagements).toBe(0)

    await importAll(exported)
    const counts = await getCounts()
    expect(counts.documents).toBe(1)
    expect(counts.engagements).toBe(1)
    expect(counts.partners).toBe(1)
    expect(counts.teamMembers).toBe(1)
  })

  it('rejects invalid export version', async () => {
    await expect(importAll({ version: 99 })).rejects.toThrow('Invalid export file')
  })
})

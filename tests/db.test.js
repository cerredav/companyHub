import { describe, it, expect, beforeEach } from 'vitest'
import {
  db,
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
  deletePartner,
  linkEngagementsByName,
  saveTeamMember,
  listTeamMembers,
  savePolicy,
  listPolicies,
  deletePolicy,
  saveMeeting,
  listMeetings,
  deleteMeeting,
  listMeetingsFor,
  linkMeeting,
  unlinkMeeting,
  countMeetingsFor,
  saveAgreement,
  listAgreements,
  deleteAgreement,
  saveBucket,
  listBuckets,
  deleteBucket,
  addFile,
  listFiles,
  deleteFile,
  listActivities,
  addActivity,
  saveActivity,
  deleteActivity,
  getCounts,
  exportAll,
  importAll,
  migrateAgreementDashboardLinks,
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
    await saveDocument({ slug: 'team-gtm', title: 'GTM Team', body: '' })
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

  it('rewrites Agreement Dashboard sheet links to the engagements tab', async () => {
    const sheet = 'https://docs.google.com/spreadsheets/d/1RmbSPj0g_Fk5fkl9RujUcFRyDZB0Vku3KwIz7uZRxWc/edit'
    await saveDocument({
      slug: 'quick-links',
      title: 'Links',
      body: `[Agreement Dashboard](${sheet})`,
    })
    await saveDocument({
      slug: 'mnda',
      title: 'MNDA',
      body: 'No external links here',
    })

    await migrateAgreementDashboardLinks()

    const quickLinks = await getDocumentBySlug('quick-links')
    expect(quickLinks.body).toBe('[Agreement Dashboard](#engagements/agreements)')

    const mnda = await getDocumentBySlug('mnda')
    expect(mnda.body).toBe('No external links here')
  })
})

describe('policies', () => {
  it('creates, lists, and deletes', async () => {
    const saved = await savePolicy({
      name: 'Travel Policy',
      notes: '',
    })
    const list = await listPolicies()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Travel Policy')

    await deletePolicy(saved.id)
    expect(await listPolicies()).toHaveLength(0)
  })

  it('round-trips body markdown', async () => {
    const saved = await savePolicy({
      name: 'Handbook',
      notes: '',
      body: '# Rules\n\nBe nice.',
    })
    const [policy] = await listPolicies()
    expect(policy.body).toBe('# Rules\n\nBe nice.')
    expect(policy.id).toBe(saved.id)
    expect(policy.lastUpdated).toBeTruthy()
  })

  it('lastUpdated reflects the latest text or document change', async () => {
    const policy = await savePolicy({ name: 'Security', notes: '' })
    const textDate = policy.updatedAt

    await new Promise((r) => setTimeout(r, 5))

    const blob = new Blob(['policy'], { type: 'application/pdf' })
    const file = new File([blob], 'policy.pdf', { type: 'application/pdf' })
    const uploaded = await addFile('policy', policy.id, file)

    const [listed] = await listPolicies()
    expect(listed.lastUpdated).toBe(
      new Date(uploaded.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    )
    expect(uploaded.updatedAt >= textDate).toBe(true)
  })

  it('strips link and manual lastUpdated on save', async () => {
    await savePolicy({
      name: 'Legacy',
      link: 'https://example.com/old',
      lastUpdated: '1 Jan 2020',
      notes: '',
    })
    const raw = await db.policies.toArray()
    expect(raw[0].link).toBeUndefined()
    expect(raw[0].lastUpdated).toBeUndefined()
  })

  it('cascade-deletes policy attachments', async () => {
    const policy = await savePolicy({
      name: 'Security',
      notes: '',
    })
    const blob = new Blob(['policy'], { type: 'application/pdf' })
    const file = new File([blob], 'policy.pdf', { type: 'application/pdf' })
    await addFile('policy', policy.id, file)
    await deletePolicy(policy.id)
    expect(await listFiles('policy', policy.id)).toHaveLength(0)
  })
})

describe('agreements', () => {
  it('creates, lists, and deletes', async () => {
    const saved = await saveAgreement({
      partner: 'Acme Corp',
      mndaSigned: 'yes',
      mndaDate: '2026-01-01',
      expiration: '2029-01-01',
      contact: 'Jane Doe',
      email: 'jane@acme.com',
      sender: 'Allison',
      others: 'Reseller: Sent',
      demo: '',
      notes: 'Test',
    })
    const list = await listAgreements()
    expect(list).toHaveLength(1)
    expect(list[0].partner).toBe('Acme Corp')
    expect(list[0].mndaSigned).toBe('yes')

    await deleteAgreement(saved.id)
    expect(await listAgreements()).toHaveLength(0)
  })
})

describe('meetings', () => {
  it('creates, lists newest-first, and deletes', async () => {
    await saveMeeting({ title: 'Older', date: '2026-01-01', attendees: '', link: '', summary: 'a' })
    const newer = await saveMeeting({ title: 'Newer', date: '2026-06-01', attendees: 'Tad', link: '', summary: 'b' })

    const list = await listMeetings()
    expect(list).toHaveLength(2)
    expect(list[0].title).toBe('Newer')

    await deleteMeeting(newer.id)
    expect(await listMeetings()).toHaveLength(1)
  })

  it('defaults engagementIds and partnerIds to empty arrays', async () => {
    await saveMeeting({ title: 'M1', date: '2026-06-01', attendees: 'Tad', link: '', summary: 's' })
    const [saved] = await listMeetings()
    expect(saved.engagementIds).toEqual([])
    expect(saved.partnerIds).toEqual([])
  })

  it('links and unlinks meetings to engagements and partners', async () => {
    const eng = await saveEngagement({
      name: 'Pilot', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const partner = await savePartner({ name: 'Acme', kind: 'partner', contact: '', status: 'active', notes: '' })
    const meeting = await saveMeeting({
      title: 'Sync', date: '2026-06-15', attendees: 'Tad', link: '', summary: 'notes',
    })

    await linkMeeting(meeting.id, 'engagement', eng.id)
    await linkMeeting(meeting.id, 'partner', partner.id)

    expect(await listMeetingsFor('engagement', eng.id)).toHaveLength(1)
    expect(await listMeetingsFor('partner', partner.id)).toHaveLength(1)
    expect(await countMeetingsFor('engagement', eng.id)).toBe(1)

    await unlinkMeeting(meeting.id, 'engagement', eng.id)
    expect(await listMeetingsFor('engagement', eng.id)).toHaveLength(0)
    expect(await listMeetingsFor('partner', partner.id)).toHaveLength(1)
  })

  it('strips meeting links when engagement or partner is deleted', async () => {
    const eng = await saveEngagement({
      name: 'Pilot', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const partner = await savePartner({ name: 'Acme', kind: 'partner', contact: '', status: 'active', notes: '' })
    const meeting = await saveMeeting({
      title: 'Sync', date: '2026-06-15', attendees: 'Tad', link: '', summary: 'notes',
      engagementIds: [eng.id],
      partnerIds: [partner.id],
    })

    await deleteEngagement(eng.id)
    let [updated] = await listMeetings()
    expect(updated.engagementIds).toEqual([])
    expect(updated.partnerIds).toEqual([partner.id])

    await deletePartner(partner.id)
    ;[updated] = await listMeetings()
    expect(updated.partnerIds).toEqual([])
    void meeting
  })
})

describe('team buckets', () => {
  it('creates, lists per team, and deletes with file cascade', async () => {
    const bucket = await saveBucket({ team: 'GTM', name: 'Contracts', notes: '', links: [] })
    await saveBucket({ team: 'Product', name: 'Roadmap', notes: '', links: [] })

    const gtm = await listBuckets('GTM')
    expect(gtm).toHaveLength(1)
    expect(gtm[0].name).toBe('Contracts')

    const file = new File([new Blob(['doc'])], 'contract.pdf', { type: 'application/pdf' })
    await addFile('bucket', bucket.id, file)
    expect(await listFiles('bucket', bucket.id)).toHaveLength(1)

    await deleteBucket(bucket.id)
    expect(await listBuckets('GTM')).toHaveLength(0)
    expect(await listFiles('bucket', bucket.id)).toHaveLength(0)
  })

  it('stores links array', async () => {
    const bucket = await saveBucket({
      team: 'GTM',
      name: 'Refs',
      notes: '',
      links: [{ label: 'Drive', url: 'https://drive.google.com' }],
    })
    const [saved] = await listBuckets('GTM')
    expect(saved.links).toHaveLength(1)
    expect(saved.links[0].url).toBe('https://drive.google.com')
    void bucket
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

  it('persists description and logs change activity when updated', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '', description: '',
    })
    const updated = await saveEngagement({ ...eng, description: 'Pilot scope and goals' })
    expect(updated.description).toBe('Pilot scope and goals')

    const list = await listEngagements()
    expect(list[0].description).toBe('Pilot scope and goals')

    const activities = await listActivities('engagement', eng.id)
    expect(activities).toHaveLength(1)
    expect(activities[0].kind).toBe('change')
    expect(activities[0].text).toContain('description: — → Pilot scope and goals')
  })
})

describe('activities', () => {
  it('adds and lists manual notes', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await addActivity({
      parentType: 'engagement',
      parentId: eng.id,
      kind: 'note',
      text: 'Call went well',
      author: 'Tad',
    })

    const list = await listActivities('engagement', eng.id)
    expect(list).toHaveLength(1)
    expect(list[0].kind).toBe('note')
    expect(list[0].text).toBe('Call went well')
    expect(list[0].author).toBe('Tad')
  })

  it('accepts a custom createdAt timestamp', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const ts = '2026-01-15T14:30:00.000Z'
    await addActivity({
      parentType: 'engagement',
      parentId: eng.id,
      kind: 'note',
      text: 'Backdated note',
      createdAt: ts,
    })

    const [note] = await listActivities('engagement', eng.id)
    expect(note.createdAt).toBe(ts)
  })

  it('edits manual notes including text, author, and timestamp', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const note = await addActivity({
      parentType: 'engagement',
      parentId: eng.id,
      kind: 'note',
      text: 'Original',
      author: 'Tad',
    })

    await saveActivity({
      id: note.id,
      text: 'Revised',
      author: 'Colby',
      createdAt: '2026-02-01T10:00:00.000Z',
    })

    const [updated] = await listActivities('engagement', eng.id)
    expect(updated.text).toBe('Revised')
    expect(updated.author).toBe('Colby')
    expect(updated.createdAt).toBe('2026-02-01T10:00:00.000Z')
  })

  it('rejects editing auto-captured activities', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await saveEngagement({ ...eng, status: 'paused' })
    const [change] = await listActivities('engagement', eng.id)

    await expect(saveActivity({
      id: change.id,
      text: 'nope',
    })).rejects.toThrow('Only manual notes can be edited')
  })

  it('logs change activity when engagement status is edited', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await saveEngagement({ ...eng, status: 'paused' })

    const list = await listActivities('engagement', eng.id)
    expect(list).toHaveLength(1)
    expect(list[0].kind).toBe('change')
    expect(list[0].text).toContain('status: active → paused')
  })

  it('does not log change on no-op save', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await saveEngagement({ ...eng })

    expect(await listActivities('engagement', eng.id)).toHaveLength(0)
  })

  it('logs file upload and keeps event after file delete', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const file = new File([new Blob(['x'])], 'contract.pdf', { type: 'application/pdf' })
    const saved = await addFile('engagement', eng.id, file)

    const list = await listActivities('engagement', eng.id)
    expect(list).toHaveLength(1)
    expect(list[0].kind).toBe('file')
    expect(list[0].text).toContain('contract.pdf')

    await deleteFile(saved.id)
    expect(await listActivities('engagement', eng.id)).toHaveLength(1)
  })

  it('cascade-deletes activities with engagement', async () => {
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await addActivity({
      parentType: 'engagement',
      parentId: eng.id,
      kind: 'note',
      text: 'note',
    })
    await deleteEngagement(eng.id)
    expect(await listActivities('engagement', eng.id)).toHaveLength(0)
  })

  it('cascade-deletes activities with partner', async () => {
    const partner = await savePartner({ name: 'P1', kind: 'partner', contact: '', status: 'active', notes: '' })
    await addActivity({
      parentType: 'partner',
      parentId: partner.id,
      kind: 'note',
      text: 'update',
    })
    await deletePartner(partner.id)
    expect(await listActivities('partner', partner.id)).toHaveLength(0)
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
  it('creates and lists with owner', async () => {
    await savePartner({ name: 'DataCo', kind: 'data provider', contact: '', status: 'active', owner: 'Tad', notes: '' })
    const list = await listPartners()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('DataCo')
    expect(list[0].owner).toBe('Tad')
  })

  it('defaults owner to empty string', async () => {
    await savePartner({ name: 'NoOwner', kind: 'partner', contact: '', status: 'active', notes: '' })
    const [saved] = await listPartners()
    expect(saved.owner).toBe('')
  })

  it('cascade-deletes partner attachments and unlinks engagements', async () => {
    const partner = await savePartner({ name: 'Acme', kind: 'partner', contact: '', status: 'active', notes: '' })
    const eng = await saveEngagement({
      name: 'Pilot A', type: 'pilot', status: 'active',
      partner: 'Acme', partnerIds: [partner.id], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    const file = new File([new Blob(['doc'])], 'nda.pdf', { type: 'application/pdf' })
    await addFile('partner', partner.id, file)

    await deletePartner(partner.id)
    expect(await listPartners()).toHaveLength(0)
    expect(await listFiles('partner', partner.id)).toHaveLength(0)
    const [updated] = await listEngagements()
    expect(updated.id).toBe(eng.id)
    expect(updated.partnerIds).toEqual([])
  })
})

describe('engagement-partner links', () => {
  it('round-trips partnerIds through save and export/import', async () => {
    const p1 = await savePartner({ name: 'Alpha', kind: 'partner', contact: '', status: 'active', notes: '' })
    const p2 = await savePartner({ name: 'Beta', kind: 'data provider', contact: '', status: 'active', notes: '' })
    await saveEngagement({
      name: 'Deal', type: 'pilot', status: 'active',
      partner: '', partnerIds: [p1.id, p2.id], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })

    const exported = await exportAll()
    expect(exported.engagements[0].partnerIds).toEqual([p1.id, p2.id])

    await clearAll()
    await importAll(exported)
    const [restored] = await listEngagements()
    expect(restored.partnerIds).toEqual([p1.id, p2.id])
  })

  it('linkEngagementsByName matches legacy text case-insensitively', async () => {
    const partner = await savePartner({ name: 'EPIC', kind: 'partner', contact: '', status: 'active', notes: '' })
    await saveEngagement({
      name: 'Outreach', type: 'prospect', status: 'active',
      partner: 'epic', partnerIds: [], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await saveEngagement({
      name: 'Already linked', type: 'pilot', status: 'active',
      partner: 'Other', partnerIds: [partner.id], stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })

    const updated = await linkEngagementsByName()
    expect(updated).toBe(1)

    const list = await listEngagements()
    const outreach = list.find((e) => e.name === 'Outreach')
    const linked = list.find((e) => e.name === 'Already linked')
    expect(outreach.partnerIds).toEqual([partner.id])
    expect(linked.partnerIds).toEqual([partner.id])
  })
})

describe('team members', () => {
  it('creates and lists with location and timezone', async () => {
    await saveTeamMember({
      name: 'Alex', role: 'Eng', team: 'Core', email: '',
      location: 'London, UK', timezone: 'Europe/London', notes: '',
    })
    const list = await listTeamMembers()
    expect(list).toHaveLength(1)
    expect(list[0].team).toBe('Core')
    expect(list[0].location).toBe('London, UK')
    expect(list[0].timezone).toBe('Europe/London')
  })
})

describe('export / import', () => {
  it('round-trips v2 with files, policies, and meetings', async () => {
    await saveDocument({ slug: 'strategy', title: 'Strategy', body: 'body' })
    const eng = await saveEngagement({
      name: 'E1', type: 'pilot', status: 'active',
      partner: '', stage: '', owner: '', poc: '', pocContact: '',
      startDate: '', nextStep: '', notes: '',
    })
    await savePartner({ name: 'P1', kind: 'partner', contact: '', status: 'active', notes: '' })
    await saveTeamMember({ name: 'T1', role: '', team: '', email: '', notes: '' })
    await savePolicy({ name: 'Handbook', notes: '' })
    await saveMeeting({
      title: 'M1', date: '2026-06-01', attendees: '', link: '', summary: 's',
      engagementIds: [eng.id],
    })
    await saveAgreement({
      partner: 'P2', mndaSigned: 'no', mndaDate: '', expiration: '',
      contact: '', email: '', sender: '', others: '', demo: '', notes: '',
    })
    await addActivity({
      parentType: 'engagement',
      parentId: eng.id,
      kind: 'note',
      text: 'progress',
    })
    await saveBucket({ team: 'GTM', name: 'B1', notes: 'n', links: [] })
    const file = new File([new Blob(['attach'])], 'a.txt', { type: 'text/plain' })
    await addFile('engagement', eng.id, file)

    const exported = await exportAll()
    expect(exported.version).toBe(2)
    expect(exported.files).toHaveLength(1)
    expect(exported.policies).toHaveLength(1)
    expect(exported.meetings).toHaveLength(1)
    expect(exported.buckets).toHaveLength(1)
    expect(exported.agreements).toHaveLength(1)
    expect(exported.activities).toHaveLength(2)
    expect(exported.activities.map((a) => a.kind).sort()).toEqual(['file', 'note'])

    await clearAll()
    await importAll(exported)
    const counts = await getCounts()
    expect(counts.documents).toBe(1)
    expect(counts.engagements).toBe(1)
    expect(counts.partners).toBe(1)
    expect(counts.teamMembers).toBe(1)
    expect(counts.files).toBe(1)
    expect(counts.policies).toBe(1)
    expect(counts.meetings).toBe(1)
    expect(counts.agreements).toBe(1)
    expect(await listBuckets('GTM')).toHaveLength(1)
    expect(await listAgreements()).toHaveLength(1)
    expect(await listActivities('engagement', eng.id)).toHaveLength(2)
    const [restoredMeeting] = await listMeetings()
    expect(restoredMeeting.engagementIds).toEqual([eng.id])
    expect(await listMeetingsFor('engagement', eng.id)).toHaveLength(1)
  })

  it('imports v2 exports without activities array', async () => {
    const v2 = {
      version: 2,
      documents: [{ id: 'd1', slug: 'strategy', title: 'S', body: '', updatedAt: '2026-01-01' }],
      engagements: [],
      partners: [],
      teamMembers: [],
      files: [],
    }
    await importAll(v2)
    expect(await db.activities.count()).toBe(0)
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

  it('imports v2 exports without agreements array', async () => {
    const v2 = {
      version: 2,
      documents: [{ id: 'd1', slug: 'strategy', title: 'S', body: '', updatedAt: '2026-01-01' }],
      engagements: [],
      partners: [],
      teamMembers: [],
      files: [],
    }
    await importAll(v2)
    expect((await getCounts()).agreements).toBe(0)
  })

  it('rejects invalid export version', async () => {
    await expect(importAll({ version: 99 })).rejects.toThrow('Invalid export file')
  })
})

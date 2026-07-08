// Seeded from Larx infonet (downloaded page sources, Jul 2026).
// Update when infonet changes; re-import via Home export/import.

/** Previous seed body — used to detect unedited strategy for one-shot top-up */
export const legacyStrategyBody = `# Larx Strategy

## Mission

Build the inference layer — the bridge between visualization and decision-making. Everything in one place: a single pane of glass for geospatial intelligence.

## Positioning

- **Infrastructure, not software** — emphasizes interoperability over prepackaged SaaS
- **75–85% solution** — deploy the base product, customize with engineering resources; self-awareness about imperfection builds trust
- **Inference layer** — connect raw data streams to actionable decisions

## Priorities

1. Active pilots and contracts (ARL, UK Naval SOF, Florida counter-drug, Joint EOD)
2. Product consistency — team messaging aligned on value prop
3. Partner and data-provider relationships tracked and maintained
4. Process documentation lives here, not scattered in Drive

## Messaging (use consistently)

- "Single pane of glass"
- "Everything in one place"
- "Deploy fast, customize with engineering"
`

export const strategyDoc = {
  slug: 'strategy',
  title: 'Larx Strategy',
  body: `# Larx Strategy

## Purpose

Enable high-stakes enterprise teams to survive in an information-overloaded environment.

Users curate interconnected knowledge, leverage automated fusion and analysis, and collaborate to win.

**In one sentence:** Larx is a cognitive system for entire teams that operate in mission-critical environments.

## Today, Zero to One

## Strategy pillars

Each pillar has a deck on infonet — open the link for the full presentation.

| Pillar | Deck |
|--------|------|
| The Larx Strategy | [Open deck](https://docs.google.com/presentation/d/1i9D9ieNkhjAYwVm1QVjxvf3O3u6i-H8SIci4M27udBA/present) |
| Product Strategy (FY28 Vision, rev Jun 2026) | [Open deck](https://docs.google.com/presentation/d/12PmImHN3-TulPG9UjZvDW7o1WHj6eFpQPIrUlzgRZsk/present) |
| Marketing Strategy | [Open deck](https://docs.google.com/presentation/d/1hW3MUv2iCYiXhtOsY5W50LswoNZ5ot5KbQU2jqMvwo0/present) |
| Sales Strategy | [Open deck](https://docs.google.com/presentation/d/1PDQ8ohLQchwWIf2zTmjgVwuLVwjKACmIerXFVLgm8D4/present) |
| Human Capital Strategy | See infonet Team Information |
`,
}

export const companyInfoDoc = {
  slug: 'company-info',
  title: 'Company',
  body: `# Who and What Are We?

**Purpose:** Enable high-stakes enterprise teams to survive in an information-overloaded environment.

**Larx, in one sentence:** A cognitive system for entire teams that operate in mission-critical environments.

## Offices

**Larx, Inc.** (Parent)
3131 Piedmont Road, Suite 200
Atlanta, GA 30305

**Larx AI Ltd.** (Europe)
Manfield House, 1 Southampton Street
London, WC2R 0LR
`,
}

export const quickLinksDoc = {
  slug: 'quick-links',
  title: 'Quick Links',
  body: `# Quick Links

Curated from infonet — edit to add or remove.

- [Google Drive](https://drive.google.com/drive/folders/0AGUo78tsvhSuUk9PVA)
- [Larx Demo Site](http://app.larx-orion.com)
- [Agreement Dashboard](https://docs.google.com/spreadsheets/d/1RmbSPj0g_Fk5fkl9RujUcFRyDZB0Vku3KwIz7uZRxWc/edit) — MNDA, partnership, demo status
- [Pilot Programs](https://docs.google.com/spreadsheets/d/1R9OaACKjdDbQoD_hNpFXclV9xwKqpo8NGMVUne1Fruc/edit)
- [Sales Process & Assets](https://docs.google.com/document/d/1Y8QUaBvkuOdhJD1NxfOAI-WRt0IJQssqz7ZeKgJqK-s/edit)
- [Employee Handbook](https://drive.google.com/file/d/1q-34t0n0_gYekKQzeizixWyA5jO5cW9X/view)
- [Time Off Request](https://docs.google.com/forms/d/e/1FAIpQLScgV0Owf2Vex-D9uQwG8tP12ZKbBcVPMYcCblSBltthCk6img/viewform)
- [Brand Assets](https://drive.google.com/drive/folders/1db6QYvDL-weOrmhz5Cy9kJM0-uye4AGp)
- [Payroll & Expenses (Every.io)](https://app.every.io/login)
- [Platform & Portal Access](https://docs.google.com/spreadsheets/d/1ULOkO8DErnnVYJoZTYm5O32RGeIAYcxH/edit)
`,
}

export const homeDocs = [companyInfoDoc, quickLinksDoc]

export const RESERVED_SLUGS = new Set(['strategy', 'company-info', 'quick-links'])

export function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(slug) || slug.startsWith('team-')
}

export const processDocs = [
  {
    slug: 'onboarding',
    title: 'New Hire Onboarding',
    body: `# New Hire Onboarding

1. Set up @larx.io accounts (Google, Slack, HubSpot)
2. Meet the team — schedule intros with Colter, Tad, and your squad lead
3. Review active engagements in Larx Hub
4. Read Strategy doc and current process docs
5. Join weekly pipeline review
`,
  },
  {
    slug: 'hubspot-updates',
    title: 'HubSpot Update Process',
    body: `# HubSpot Update Process

Update all deal stages and next steps **before Friday** each week for weekend reporting.

## Per engagement

- Stage matches current reality (not aspirational)
- Next step has owner and date
- POC contact info current
- Notes capture blockers
`,
  },
  {
    slug: 'demo-prep',
    title: 'Engagement Demo Prep',
    body: `# Engagement Demo Prep

## One week before

- Confirm POC and attendees
- Verify data feeds / sample datasets ready
- Assign demo lead and backup

## Day before

- Dry run with engineering
- Upload deck to engagement attachments
- Confirm environment (prod vs demo instance)

## After demo

- Log next steps in Larx Hub within 24h
`,
  },
  {
    slug: 'pricing-contracting',
    title: 'Pricing & Contracting',
    body: `# Pricing & Contracting

Prepare sliding scale pricing (5–100 licenses) before customer meetings.

## Checklist

- [ ] Hard numbers finalized
- [ ] POC and legal contact identified
- [ ] Contract path confirmed (TRACE / BAA / direct)
- [ ] Timeline documented in engagement notes
`,
  },
  {
    slug: 'mnda',
    title: 'MNDA',
    body: `# MNDA Process

Use when a prospect or partner needs a mutual NDA before sharing materials.

1. Log the request in the [Agreement Dashboard](https://docs.google.com/spreadsheets/d/1RmbSPj0g_Fk5fkl9RujUcFRyDZB0Vku3KwIz7uZRxWc/edit)
2. Send Larx standard MNDA (see Sales Process & Assets)
3. Update status when signed
`,
  },
  {
    slug: 'partnerships',
    title: 'Partnerships',
    body: `# Partnership Agreements

For formal partnership or reseller agreements.

1. Qualify the partner — align with GTM lead
2. Track in the [Agreement Dashboard](https://docs.google.com/spreadsheets/d/1RmbSPj0g_Fk5fkl9RujUcFRyDZB0Vku3KwIz7uZRxWc/edit)
3. Legal review before signature
4. Add partner to Engagements → Partners tab once active
`,
  },
  {
    slug: 'demos',
    title: 'Demos',
    body: `# Demo Process

## Request & schedule

- Confirm POC, attendees, and use case with sales lead
- See **Engagement Demo Prep** for the runbook

## After the demo

- Submit feedback via the [Demo Feedback Form](https://forms.gle/HYc56mQF1iUMEdKz8)
- Log next steps in Larx Hub Engagements within 24h
`,
  },
  {
    slug: 'pilots',
    title: 'Pilots',
    body: `# Pilot Programs

## Tracking

- Master list: [Pilot Programs sheet](https://docs.google.com/spreadsheets/d/1R9OaACKjdDbQoD_hNpFXclV9xwKqpo8NGMVUne1Fruc/edit)
- Operational detail: Larx Hub → **Engagements** (status, POC, next step, attachments)

## Lifecycle

1. Qualify → log as prospect engagement
2. MNDA signed → move to active pilot
3. Weekly updates in HubSpot and Engagements
4. Close → completed or paused with notes
`,
  },
  {
    slug: 'time-off-request',
    title: 'Time Off Request',
    body: `# Time Off Request

1. Submit via the [Time Off Request Form](https://docs.google.com/forms/d/e/1FAIpQLScgV0Owf2Vex-D9uQwG8tP12ZKbBcVPMYcCblSBltthCk6img/viewform)
2. Approvals: Tad
3. Block calendar and notify your team
`,
  },
]

/** Process docs added after initial launch — top-up inserts if slug missing */
export const topUpProcessDocs = processDocs.filter((d) =>
  ['mnda', 'partnerships', 'demos', 'pilots', 'time-off-request'].includes(d.slug)
)

export const policies = [
  {
    name: 'Employee Handbook',
    lastUpdated: '21 Apr 2026',
    link: 'https://drive.google.com/file/d/1q-34t0n0_gYekKQzeizixWyA5jO5cW9X/view?usp=drive_link',
    notes: '',
  },
  {
    name: 'Computer and Phone Policy',
    lastUpdated: '21 Apr 2026',
    link: 'https://docs.google.com/document/d/1eZpvRGhxKAWJ6ZNqyn6dRGjAIPpuPFs8z2QZaaxogtg/edit?usp=sharing',
    notes: '',
  },
  {
    name: 'Travel Policy',
    lastUpdated: '21 Apr 2026',
    link: 'https://docs.google.com/document/d/1qsBYr5EO0RB2Z-fO4j0HdFJC85GUfPa9/edit?usp=sharing',
    notes: '',
  },
  {
    name: 'Company Holidays',
    lastUpdated: '',
    link: 'https://www.google.com/calendar/embed?color=%23cca6ac&src=c_4d5b75ec8049903aa982d9f5c7ab3d82066fd38c0c8c387d5a6a68fa7556',
    notes: 'Google Calendar',
  },
]

export const engagements = [
  {
    name: 'ARL & 203rd Infantry',
    type: 'pilot',
    partner: 'US Army Research Laboratory',
    status: 'active',
    stage: 'contracting',
    owner: 'Colby',
    poc: 'ARL contracting lead',
    pocContact: '',
    startDate: '',
    nextStep: 'Finalize contracting details; explore TRACE contract access',
    notes: 'Colby leading pricing — no deferrals.',
  },
  {
    name: 'Army ARL BAA — Data Fusion Research',
    type: 'poc',
    partner: 'US Army ARL (John Hyatt)',
    status: 'active',
    stage: 'proposal',
    owner: 'Engineering',
    poc: 'John Hyatt',
    pocContact: 'BAA Program Manager',
    startDate: '',
    nextStep: 'Submit open-source research proposal ($150k, 30-day turnaround)',
    notes: 'Topics: data fusion, information processing.',
  },
  {
    name: 'Joint EOD',
    type: 'pilot',
    partner: 'DoD EOD',
    status: 'active',
    stage: 'demo prep',
    owner: 'Brian',
    poc: 'Brian',
    pocContact: '',
    startDate: '',
    nextStep: 'Demo Tuesday/Wednesday; waiting on data components',
    notes: '',
  },
  {
    name: 'Mobile Unit 3 — Bahrain',
    type: 'pilot',
    partner: 'US DoD',
    status: 'paused',
    stage: 'deployment',
    owner: 'Tad',
    poc: 'Brent',
    pocContact: '',
    startDate: '',
    nextStep: 'Await travel clearance; Brent AAR updates',
    notes: 'Team exited Bahrain due to operational questioning.',
  },
  {
    name: 'Florida Counter-Drug (HSIDA)',
    type: 'pilot',
    partner: 'Florida HSIDA',
    status: 'active',
    stage: 'discovery',
    owner: 'Tad',
    poc: 'Chris Otiri',
    pocContact: '',
    startDate: '',
    nextStep: 'Schedule HSIDA meetings and demos via Chris',
    notes: 'Chris is adjacent to decision makers.',
  },
  {
    name: 'UK Naval Special Operations',
    type: 'contract',
    partner: 'UK MOD',
    status: 'active',
    stage: 'negotiation',
    owner: 'Tad',
    poc: 'UK Naval SOF contact',
    pocContact: '',
    startDate: '',
    nextStep: 'Structure deals — line of sight to £1M+ across deployments',
    notes: '',
  },
  {
    name: 'USMC ESRI Replacement',
    type: 'prospect',
    partner: 'US Marine Corps',
    status: 'prospect',
    stage: 'proposal',
    owner: 'Brian',
    poc: 'Captain Dwyer',
    pocContact: 'Coordinate via Ed Padinski',
    startDate: '',
    nextStep: 'Submit outfit proposal by June',
    notes: 'Potential primary GIS tool replacement for Marines.',
  },
  {
    name: 'Space Force — EPIC',
    type: 'prospect',
    partner: 'EPIC',
    status: 'prospect',
    stage: 'outreach',
    owner: 'Tad',
    poc: 'Patrick Parnell',
    pocContact: '',
    startDate: '',
    nextStep: 'Contact Patrick Parnell for Space Force strategy',
    notes: '',
  },
]

export const partners = [
  {
    name: 'EPIC',
    kind: 'partner',
    contact: 'Patrick Parnell',
    status: 'prospect',
    notes: 'Space Force strategy outreach.',
  },
  {
    name: 'ESRI',
    kind: 'vendor',
    contact: '',
    status: 'active',
    notes: 'Incumbent GIS; Marine Corps replacement opportunity.',
  },
  {
    name: 'HubSpot',
    kind: 'vendor',
    contact: '',
    status: 'active',
    notes: 'CRM — weekly deal updates required before Friday.',
  },
]

export const teamMembers = [
  { name: 'Colter', role: 'Leadership', team: 'Executive', email: 'colter@larx.io', notes: '' },
  { name: 'Tad', role: 'Business Development', team: 'GTM', email: 'tad@larx.io', notes: 'UK ops, ARL calendar, expense approvals' },
  { name: 'Colby', role: 'Sales / Pricing', team: 'GTM', email: 'colby@larx.io', notes: 'ARL meetings, Captain Dwyer outreach' },
  { name: 'Rory', role: 'Business Development', team: 'GTM', email: 'rory@larx.io', notes: 'UK operations' },
  { name: 'Brian', role: 'Programs', team: 'GTM', email: 'brian@larx.io', notes: 'Joint EOD, USMC proposal' },
  { name: 'Marae', role: 'Product', team: 'Product', email: 'marae@larx.io', notes: 'Financial services positioning' },
  { name: 'Daria', role: '', team: '', email: 'daria@larx.io', notes: '' },
  { name: 'Allison', role: 'Product', team: 'Product', email: '', notes: 'Roadmap, product feedback' },
  { name: 'Andres', role: 'Engineering', team: 'Engineering', email: 'andres@larx.io', notes: '' },
]

// Meeting summaries from Granola notes.
// record: { title, date (YYYY-MM-DD), attendees, link (Granola transcript), summary (markdown) }
export const meetings = [
  {
    title: 'Weekly Pipeline Review',
    date: '2026-04-30',
    attendees: 'Colter, Tad, Colby, Rory, Daria, Brian, Marae',
    link: 'https://notes.granola.ai/t/61b52318-2aa4-4b61-8090-e131c46df6cf-00demib2',
    summary: `## Deal Updates & Progress

- **ARL & 203rd** — meeting tomorrow; finalizing contracting details and hard numbers. Potential Army TRACE contract access through same contact. Colby leading pricing.
- **John Hyatt (ARL BAA)** — $150k for public research (data fusion, information processing); 30-day turnaround if proposal aligns.
- **Joint EOD** — waiting on Brian for data components; demo prep next week.
- **Mobile Unit 3** — deployment delayed; team exited Bahrain, travel restricted until June 1. Brent providing AAR updates.
- **Florida counter-drug** — Chris Otiri now primary POC; will facilitate HSIDA meetings and demos.

## UK Operations

- Tad and Rory completed full day of gov/private sector calls.
- UK Naval SOF meeting Wednesday — line of sight to £1M+ across deployments.
- Marine Corps ESRI-replacement opportunity — Brian working Modern Day Marine angle.

## Positioning & Messaging

- Infrastructure-vs-software positioning gaining traction; "inference layer" concept resonating.
- 75–85% solution approach building customer trust.
- "Single pane of glass" / "everything in one place" — use consistently.

## Action Items

- Tad: ARL/203rd calendar, sliding-scale pricing (5–100 licenses), contact Patrick Parnell (EPIC), approve expenses
- Colby: ARL meeting 1–2pm ET, TRACE opportunity, Captain Dwyer within 2 weeks (via Ed Padinski)
- Brian: USMC outfit proposal by June
- All: Update HubSpot before Friday
`,
  },
]

// Seeded from Larx infonet / internal pipeline notes (infonet Google Site requires auth).
// Update this file when infonet content changes; re-import via Home export/import.

export const strategyDoc = {
  slug: 'strategy',
  title: 'Larx Strategy',
  body: `# Larx Strategy

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
`,
}

export const processDocs = [
  {
    slug: 'onboarding',
    title: 'New Hire Onboarding',
    body: `# New Hire Onboarding

1. Set up @larx.io accounts (Google, Slack, HubSpot)
2. Meet the team — schedule intros with Colter, Tad, and your squad lead
3. Review active engagements in Company Hub
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

## Owners

Each engagement \`owner\` field in Company Hub should match HubSpot deal owner.
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
- Export supporting deck to engagement attachments
- Confirm environment (prod vs demo instance)

## After demo

- Log next steps in Company Hub within 24h
- Upload any shared materials to engagement attachments
`,
  },
  {
    slug: 'pricing-contracting',
    title: 'Pricing & Contracting',
    body: `# Pricing & Contracting

## License pricing

Prepare sliding scale pricing (5–100 licenses) before customer meetings. No "we'll get back to you" on pricing calls.

## Contracting checklist

- [ ] Hard numbers finalized
- [ ] POC and legal contact identified
- [ ] TRACE / BAA / direct contract path confirmed
- [ ] Timeline and deliverables documented in engagement notes
`,
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
    notes: 'Meeting scheduled; hard numbers in progress. Colby leading pricing — no deferrals.',
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
    nextStep: 'Demo Tuesday/Wednesday; waiting on Brian for data components',
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
    nextStep: 'Await travel clearance (restricted until June 1); Brent AAR updates',
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
    notes: 'Chris is adjacent to decision makers, not middle management.',
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
    notes: 'Tad and Rory completed full day of gov/private sector calls.',
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
    nextStep: 'Submit outfit proposal by June; Modern Day Marine angle',
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

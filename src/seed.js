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
- [Agreement Tracker](#engagements/agreements) — MNDA, partnership, demo status
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

1. Log the request in the [Agreement Tracker](#engagements/agreements)
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
2. Track in the [Agreement Tracker](#engagements/agreements)
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
    notes: '',
  },
  {
    name: 'Computer and Phone Policy',
    notes: '',
  },
  {
    name: 'Travel Policy',
    notes: '',
  },
  {
    name: 'Company Holidays',
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
    owner: 'Tad',
    notes: 'Space Force strategy outreach.',
  },
  {
    name: 'ESRI',
    kind: 'vendor',
    contact: '',
    status: 'active',
    owner: 'Brian',
    notes: 'Incumbent GIS; Marine Corps replacement opportunity.',
  },
  {
    name: 'HubSpot',
    kind: 'vendor',
    contact: '',
    status: 'active',
    owner: '',
    notes: 'CRM — weekly deal updates required before Friday.',
  },
]

export const teamMembers = [
  { name: 'Colter', role: 'Leadership', team: 'Executive', email: 'colter@larx.io', location: 'Washington, DC', timezone: 'America/New_York', notes: '' },
  { name: 'Tad', role: 'Business Development', team: 'GTM', email: 'tad@larx.io', location: 'London, UK', timezone: 'Europe/London', notes: 'UK ops, ARL calendar, expense approvals' },
  { name: 'Colby', role: 'Sales / Pricing', team: 'GTM', email: 'colby@larx.io', location: 'Washington, DC', timezone: 'America/New_York', notes: 'ARL meetings, Captain Dwyer outreach' },
  { name: 'Rory', role: 'Business Development', team: 'GTM', email: 'rory@larx.io', location: 'London, UK', timezone: 'Europe/London', notes: 'UK operations' },
  { name: 'Brian', role: 'Programs', team: 'GTM', email: 'brian@larx.io', location: 'Norfolk, VA', timezone: 'America/New_York', notes: 'Joint EOD, USMC proposal' },
  { name: 'Marae', role: 'Product', team: 'Product', email: 'marae@larx.io', location: 'San Francisco, CA', timezone: 'America/Los_Angeles', notes: 'Financial services positioning' },
  { name: 'Daria', role: '', team: '', email: 'daria@larx.io', location: '', timezone: '', notes: '' },
  { name: 'Allison', role: 'Product', team: 'Product', email: '', location: 'Washington, DC', timezone: 'America/New_York', notes: 'Roadmap, product feedback' },
  { name: 'Andres', role: 'Engineering', team: 'Engineering', email: 'andres@larx.io', location: 'Baltimore, MD', timezone: 'America/New_York', notes: '' },
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

export const agreements = [
  {
    partner: "Braden Parent",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "Braden Parent",
    email: "bparent006@gmail.com",
    sender: "",
    others: "Reseller: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "Matt Dorn",
    mndaSigned: "no",
    mndaDate: "2025-12-22",
    expiration: "2027-12-22",
    contact: "Matt Dorn",
    email: "mattdorn866@hotmail.com",
    sender: "Allison",
    others: "Reseller: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "ProAI",
    mndaSigned: "no",
    mndaDate: "2025-10-16",
    expiration: "2028-10-16",
    contact: "Sabra Mitchell",
    email: "",
    sender: "Allison",
    others: "Reseller: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "Adam Cox",
    mndaSigned: "no",
    mndaDate: "2025-09-04",
    expiration: "2028-09-04",
    contact: "Adam Cox",
    email: "adam.grant.cox@gmail.com",
    sender: "Colter",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "DJ Hoyt",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "DJ Hoyt",
    email: "djhoyt13@gmail.com",
    sender: "Adam",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Freddie MacSwiney",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "Freddie MacSwiney",
    email: "freddie.mac@msn.com",
    sender: "Allison",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "LunateAI",
    mndaSigned: "yes",
    mndaDate: "2026-02-22",
    expiration: "2029-02-22",
    contact: "Nadine Alameh",
    email: "",
    sender: "Allison",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Ashlee Sapp",
    mndaSigned: "yes",
    mndaDate: "2025-05-24",
    expiration: "2028-05-24",
    contact: "Ashlee Sapp",
    email: "",
    sender: "Tad",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Brian Kirby",
    mndaSigned: "yes",
    mndaDate: "2025-12-12",
    expiration: "2028-12-12",
    contact: "Brian Kirby",
    email: "brian.t.kirby@gmail.com",
    sender: "Allison",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "CenCore",
    mndaSigned: "yes",
    mndaDate: "2026-01-14",
    expiration: "2027-07-14",
    contact: "Rebecca Curtis",
    email: "",
    sender: "Colter",
    others: "Reseller: Signed · Teaming: Signed",
    demo: "",
    notes: "CenCore NDA",
  },
  {
    partner: "Christopher Oteri",
    mndaSigned: "yes",
    mndaDate: "2025-11-05",
    expiration: "2028-11-05",
    contact: "Christopher Oteri",
    email: "christopher.oteri@gmail.com",
    sender: "Allison",
    others: "Reseller: Signed",
    demo: "60 days · Chris Oteri",
    notes: "",
  },
  {
    partner: "Marcus Polson",
    mndaSigned: "yes",
    mndaDate: "2025-09-26",
    expiration: "2028-09-26",
    contact: "Marcus Polson",
    email: "polsonmarc@yahoo.com",
    sender: "Allison",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Charlie Mayne (UK)",
    mndaSigned: "no",
    mndaDate: "2026-04-02",
    expiration: "",
    contact: "Charlie Mayne",
    email: "",
    sender: "",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Altamira Technology Corp",
    mndaSigned: "no",
    mndaDate: "2026-01-30",
    expiration: "2029-01-30",
    contact: "Paul Higgett",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Array Labs",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "Ryan Duffy",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Kplr",
    mndaSigned: "no",
    mndaDate: "2025-06-30",
    expiration: "2028-06-30",
    contact: "Paul Bence",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Delayed  in legal",
  },
  {
    partner: "Labrys",
    mndaSigned: "no",
    mndaDate: "2026-01-23",
    expiration: "2029-01-23",
    contact: "Gus",
    email: "",
    sender: "Allison",
    others: "Partnership: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "Leidos",
    mndaSigned: "no",
    mndaDate: "2026-01-23",
    expiration: "2029-01-23",
    contact: "Scott Diamanti",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Michelle Maharaj",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Requested info 1/22",
  },
  {
    partner: "Motionsafe",
    mndaSigned: "no",
    mndaDate: "2025-10-29",
    expiration: "2028-10-29",
    contact: "Jessie",
    email: "",
    sender: "Allison",
    others: "",
    demo: "Enoch ??",
    notes: "",
  },
  {
    partner: "Pure Cipher",
    mndaSigned: "no",
    mndaDate: "2025-05-01",
    expiration: "2028-05-01",
    contact: "Wendy Chin",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "SafePro",
    mndaSigned: "no",
    mndaDate: "2026-01-08",
    expiration: "2029-01-08",
    contact: "Jasper Baur",
    email: "",
    sender: "Allison",
    others: "Partnership: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "SpearAI",
    mndaSigned: "no",
    mndaDate: "2025-10-08",
    expiration: "2028-10-08",
    contact: "Jeff Reilly",
    email: "",
    sender: "Colter",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Victoria Fall Technology",
    mndaSigned: "no",
    mndaDate: "2026-01-30",
    expiration: "2029-01-30",
    contact: "Sarah Bakhtiari",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Wyvern",
    mndaSigned: "no",
    mndaDate: "2025-07-10",
    expiration: "2028-07-10",
    contact: "Eosther Anstine",
    email: "",
    sender: "Adam",
    others: "",
    demo: "",
    notes: "Never recieved a countersigned version; Wyvern's NDA",
  },
  {
    partner: "GDIT",
    mndaSigned: "no",
    mndaDate: "2026-02-22",
    expiration: "2029-02-22",
    contact: "Clinton Austin",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Skyeton",
    mndaSigned: "no",
    mndaDate: "2026-02-22",
    expiration: "2029-02-22",
    contact: "Roman Kniazhenko",
    email: "",
    sender: "Daria",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Lucas France",
    mndaSigned: "no",
    mndaDate: "2026-03-02",
    expiration: "2029-03-02",
    contact: "Lucas French",
    email: "Lucas.France101@mod.gov.uk",
    sender: "Allison/Adam",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "ADS",
    mndaSigned: "yes",
    mndaDate: "2026-01-09",
    expiration: "",
    contact: "Parker Pinnell",
    email: "",
    sender: "Colter",
    others: "Teaming: Sent",
    demo: "",
    notes: "ADS NDA +Teaming",
  },
  {
    partner: "Meridian Systematics",
    mndaSigned: "yes",
    mndaDate: "2026-02-03",
    expiration: "2029-02-03",
    contact: "Michelle Maharaj",
    email: "",
    sender: "Allison",
    others: "Partnership: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Northop Grumann",
    mndaSigned: "yes",
    mndaDate: "2026-03-03",
    expiration: "2029-03-03",
    contact: "Shaun Gorman",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Augur",
    mndaSigned: "yes",
    mndaDate: "2025-04-11",
    expiration: "2028-04-11",
    contact: "Harry Mead",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Automated Control Systems",
    mndaSigned: "yes",
    mndaDate: "2025-06-30",
    expiration: "2028-06-30",
    contact: "Shelly Johnson",
    email: "",
    sender: "Adam",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Barbicum",
    mndaSigned: "yes",
    mndaDate: "2025-07-16",
    expiration: "2028-07-16",
    contact: "Scott Feldmayer",
    email: "",
    sender: "Allison",
    others: "",
    demo: "2025-09-18 · 30 days · 2025-10-30 · Matt James",
    notes: "",
  },
  {
    partner: "BCORE",
    mndaSigned: "yes",
    mndaDate: "2025-09-09",
    expiration: "2028-09-09",
    contact: "Bryant Crouch",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Blue Fusion Technologies",
    mndaSigned: "yes",
    mndaDate: "2025-12-15",
    expiration: "2027-12-15",
    contact: "Bruce Parkman",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "BlueStaq",
    mndaSigned: "yes",
    mndaDate: "2025-12-03",
    expiration: "2028-12-03",
    contact: "Lisa Peregrin",
    email: "",
    sender: "Allison",
    others: "Teaming: Sent",
    demo: "",
    notes: "BlueStaq NDA",
  },
  {
    partner: "Capt Edward Buster",
    mndaSigned: "yes",
    mndaDate: "2025-07-18",
    expiration: "2028-07-18",
    contact: "Capt Edward Buster",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Carly Campbell",
    mndaSigned: "yes",
    mndaDate: "2025-11-13",
    expiration: "2028-11-13",
    contact: "Carly Campbell",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Daria Antonovska",
    mndaSigned: "yes",
    mndaDate: "2025-10-01",
    expiration: "2028-10-01",
    contact: "Daria Antonovska",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Dark Wolf",
    mndaSigned: "yes",
    mndaDate: "2025-07-31",
    expiration: "2027-07-31",
    contact: "Liz Leiby",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Dark Wolf's NDA",
  },
  {
    partner: "DejaVuAI",
    mndaSigned: "yes",
    mndaDate: "2025-11-11",
    expiration: "2028-11-11",
    contact: "Jeff Benson",
    email: "",
    sender: "Allison",
    others: "Partnership: Signed",
    demo: "",
    notes: "DejaVu NDA",
  },
  {
    partner: "Denovo",
    mndaSigned: "yes",
    mndaDate: "2026-01-15",
    expiration: "2029-01-15",
    contact: "Danny Moore",
    email: "",
    sender: "Allison",
    others: "Teaming: Signed",
    demo: "",
    notes: "Signed their MNDA on 2/19",
  },
  {
    partner: "GEO261",
    mndaSigned: "yes",
    mndaDate: "2025-06-25",
    expiration: "2028-06-25",
    contact: "Brian Monheiser",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Harod Associates",
    mndaSigned: "yes",
    mndaDate: "2026-01-26",
    expiration: "2029-01-26",
    contact: "Martin",
    email: "",
    sender: "Allison",
    others: "Partnership: Sent",
    demo: "",
    notes: "",
  },
  {
    partner: "Hippo Digital Limited",
    mndaSigned: "yes",
    mndaDate: "2025-12-08",
    expiration: "2027-12-08",
    contact: "Kirsty Angell",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "Hippo NDA",
  },
  {
    partner: "Holan Group",
    mndaSigned: "yes",
    mndaDate: "2025-07-16",
    expiration: "2028-07-16",
    contact: "Johnathon Holmes",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Iceye",
    mndaSigned: "yes",
    mndaDate: "2026-01-22",
    expiration: "2028-01-22",
    contact: "Patrick Oakes",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Iceye NDA",
  },
  {
    partner: "Invictus Global Response",
    mndaSigned: "yes",
    mndaDate: "2025-04-16",
    expiration: "2028-04-16",
    contact: "Jon Ricketts",
    email: "",
    sender: "Colby",
    others: "Partnership: Signed · Donation: Signed · EUSA: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Kagswerks",
    mndaSigned: "yes",
    mndaDate: "2025-06-26",
    expiration: "2028-06-26",
    contact: "Mike Stucki",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Lekha Challappa",
    mndaSigned: "yes",
    mndaDate: "2025-10-27",
    expiration: "2028-10-27",
    contact: "Portis Psych",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Lightscline",
    mndaSigned: "yes",
    mndaDate: "2025-11-05",
    expiration: "2028-11-05",
    contact: "Ankur Verma",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Loft Orbital",
    mndaSigned: "yes",
    mndaDate: "2025-03-28",
    expiration: "2030-03-28",
    contact: "Mitchell Scher",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "Loft's NDA",
  },
  {
    partner: "Method Analytics",
    mndaSigned: "yes",
    mndaDate: "2025-07-11",
    expiration: "2028-07-11",
    contact: "Freddie MacSwiney",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Mike Feltham",
    mndaSigned: "yes",
    mndaDate: "2025-09-03",
    expiration: "2028-09-03",
    contact: "Mike Feltham",
    email: "",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Mind Alliance",
    mndaSigned: "yes",
    mndaDate: "2026-01-28",
    expiration: "2029-01-28",
    contact: "David Kamien",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Octaris",
    mndaSigned: "yes",
    mndaDate: "2025-06-25",
    expiration: "2028-06-25",
    contact: "Chris Blake",
    email: "",
    sender: "Allison",
    others: "",
    demo: "30 days · Julie Watkins",
    notes: "",
  },
  {
    partner: "Reveal",
    mndaSigned: "yes",
    mndaDate: "2026-01-07",
    expiration: "2029-01-07",
    contact: "Brian Detwiler",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "RGi",
    mndaSigned: "yes",
    mndaDate: "2025-06-20",
    expiration: "2026-06-20",
    contact: "Wayne Hawkins",
    email: "",
    sender: "Colter",
    others: "Teaming: Signed",
    demo: "",
    notes: "RGi's NDA",
  },
  {
    partner: "ScalePost",
    mndaSigned: "yes",
    mndaDate: "2025-12-02",
    expiration: "2028-12-02",
    contact: "Zach Todd",
    email: "",
    sender: "Tad",
    others: "Partnership: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "Sentinel Flight Services",
    mndaSigned: "yes",
    mndaDate: "2025-06-24",
    expiration: "2028-06-24",
    contact: "Adrian Rickett",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Soresu",
    mndaSigned: "yes",
    mndaDate: "2026-01-15",
    expiration: "2027-07-15",
    contact: "Evan Gibson",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Spire",
    mndaSigned: "yes",
    mndaDate: "2025-06-02",
    expiration: "2028-06-02",
    contact: "Zach Knoche",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Spire NDA",
  },
  {
    partner: "Trace3",
    mndaSigned: "yes",
    mndaDate: "2026-01-27",
    expiration: "2029-01-27",
    contact: "KC Cerreta",
    email: "",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Sent back redlines 1/21",
  },
  {
    partner: "Valcrye System",
    mndaSigned: "yes",
    mndaDate: "2025-06-20",
    expiration: "2028-06-20",
    contact: "Alex Kahihihkolo",
    email: "",
    sender: "Allison",
    others: "",
    demo: "30 days · Alex Kolo",
    notes: "",
  },
  {
    partner: "SR Davies",
    mndaSigned: "yes",
    mndaDate: "2026-02-22",
    expiration: "2029-02-22",
    contact: "Steve Davies",
    email: "s.r.davies@protonmail.com",
    sender: "Adam",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "BAE Systems",
    mndaSigned: "yes",
    mndaDate: "2026-03-04",
    expiration: "2029-03-04",
    contact: "",
    email: "",
    sender: "Rory",
    others: "",
    demo: "",
    notes: "BAE NDA",
  },
  {
    partner: "SAIC",
    mndaSigned: "yes",
    mndaDate: "2026-02-22",
    expiration: "2029-02-22",
    contact: "",
    email: "",
    sender: "Rory",
    others: "",
    demo: "",
    notes: "RE: GBRD SDIC MNDA",
  },
  {
    partner: "Apogee",
    mndaSigned: "yes",
    mndaDate: "2026-02-27",
    expiration: "2029-02-27",
    contact: "Jared Shapiro",
    email: "jared.shapiro@apogeeusa.com",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Northop Grumman",
    mndaSigned: "yes",
    mndaDate: "2026-03-02",
    expiration: "2029-03-02",
    contact: "",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "DeNovo - SAMWISE",
    mndaSigned: "yes",
    mndaDate: "2026-02-19",
    expiration: "2029-02-19",
    contact: "Sean O'Grady",
    email: "sean.ogrady@thedenovo.com",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Planet Labs",
    mndaSigned: "yes",
    mndaDate: "2026-03-05",
    expiration: "2029-03-05",
    contact: "Erik Hajek",
    email: "erik.hajek@federal.planet.com",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Claritas (UK)",
    mndaSigned: "yes",
    mndaDate: "2026-03-11",
    expiration: "2029-03-11",
    contact: "",
    email: "",
    sender: "Rory",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "OneDev",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "",
    email: "",
    sender: "Allison",
    others: "Contract: Signed",
    demo: "",
    notes: "To hold clearances",
  },
  {
    partner: "Triad",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "Kristin Ryland",
    email: "",
    sender: "Colter",
    others: "Teaming: Signed",
    demo: "",
    notes: "NOAA AWIPS",
  },
  {
    partner: "Elder Research",
    mndaSigned: "yes",
    mndaDate: "2026-03-13",
    expiration: "2029-03-13",
    contact: "Jeff Witmer",
    email: "jeff.witmer@elderresearch.com",
    sender: "Tad",
    others: "",
    demo: "",
    notes: "ER MNDA",
  },
  {
    partner: "UMBRAS Operations Ltd",
    mndaSigned: "yes",
    mndaDate: "2026-03-18",
    expiration: "2029-03-18",
    contact: "Ben",
    email: "ba@umbras.uk",
    sender: "Rory",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "EPOCH",
    mndaSigned: "yes",
    mndaDate: "2026-03-30",
    expiration: "2029-03-30",
    contact: "Patrick",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Frazer Nash (UK)",
    mndaSigned: "yes",
    mndaDate: "2026-04-13",
    expiration: "2029-04-13",
    contact: "",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "FN MNDA + LAI Rider",
  },
  {
    partner: "UFORCE (UK)",
    mndaSigned: "yes",
    mndaDate: "2026-03-25",
    expiration: "2029-03-25",
    contact: "",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "BAE/Techmodal (UK)",
    mndaSigned: "yes",
    mndaDate: "2026-04-07",
    expiration: "2029-04-07",
    contact: "",
    email: "",
    sender: "",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "OCCAM Solutions",
    mndaSigned: "yes",
    mndaDate: "2026-04-13",
    expiration: "2029-04-13",
    contact: "Annie Lee",
    email: "",
    sender: "Adam",
    others: "",
    demo: "",
    notes: "OCCAM MNDA",
  },
  {
    partner: "Oracle (UK)",
    mndaSigned: "yes",
    mndaDate: "2026-05-07",
    expiration: "2027-05-07",
    contact: "Nikki Rumbold",
    email: "nikki.rumbold@oracle.com",
    sender: "Rory",
    others: "",
    demo: "",
    notes: "Oracle NDA",
  },
  {
    partner: "Nathan James",
    mndaSigned: "no",
    mndaDate: "",
    expiration: "",
    contact: "Nathan James",
    email: "",
    sender: "Rob",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Meridian Systematics",
    mndaSigned: "yes",
    mndaDate: "2025-10-15",
    expiration: "2028-10-15",
    contact: "Kayla Marmen",
    email: "",
    sender: "Colter",
    others: "",
    demo: "",
    notes: "Meridian MNDA for COSMIC",
  },
  {
    partner: "Orbital Sidekick",
    mndaSigned: "no",
    mndaDate: "2026-05-22",
    expiration: "2028-05-22",
    contact: "Jon Polay",
    email: "jon.polay@orbitalsidekick.com",
    sender: "Allison",
    others: "",
    demo: "",
    notes: "Orbital MNDA",
  },
  {
    partner: "Tim McGuire",
    mndaSigned: "no",
    mndaDate: "2026-05-19",
    expiration: "2029-05-19",
    contact: "Tim McGuire",
    email: "",
    sender: "Colby",
    others: "Reseller: Signed",
    demo: "",
    notes: "",
  },
  {
    partner: "GravTech",
    mndaSigned: "yes",
    mndaDate: "2026-05-15",
    expiration: "2028-05-15",
    contact: "Nick Williams",
    email: "nick@gravtech.co.uk",
    sender: "Brian",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Tenna Systems",
    mndaSigned: "no",
    mndaDate: "2026-07-01",
    expiration: "2028-07-01",
    contact: "Avner",
    email: "avner@tennasys.com",
    sender: "Barbero",
    others: "",
    demo: "",
    notes: "",
  },
  {
    partner: "Hey Capto",
    mndaSigned: "no",
    mndaDate: "2026-06-16",
    expiration: "2028-06-16",
    contact: "",
    email: "",
    sender: "Marae",
    others: "",
    demo: "",
    notes: "",
  },
]

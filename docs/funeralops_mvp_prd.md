# FuneralOps — MVP PRD (V2)
*Modern workflow + compliance guardrails layer for independent funeral homes*

> **North Star:** First call → compliant, ready-for-arrangement packet in **< 10 minutes**, with **zero missing signatures/docs**, and **no case can be closed** unless essentials are satisfied.

---

## 1) Product Summary

### 1.1 One-liner
A cloud app that turns messy intake notes into a structured case timeline, generates required document packs, tracks signatures, and enforces compliance guardrails—without forcing an immediate rip-and-replace of existing systems.

### 1.2 Who it’s for (MVP ICP)
Independent funeral homes (1–5 locations) doing at-need cases weekly/daily that:
- feel paper/duplicate-entry chaos
- have missing signature/document risk
- want modern tools, but fear migration / downtime

### 1.3 Outcomes
- **Speed:** Reduce admin time per case via AI-assisted intake + packet generation
- **Accuracy:** Reduce rework via consistency checks + “what’s missing” blockers
- **Compliance:** Maintain audit trail + policy guardrails (GPL acknowledgement, authorizations, etc.)
- **Adoption:** Layer-first: start using for workflow/docs/signatures without full migration

---

## 2) Scope & Principles

### 2.1 MVP In Scope (must ship)
- Today Board (daily operations)
- Case Timeline (stage-based workflow)
- AI Intake Copilot (assistive, confirm-first)
- Document Engine (template packs + PDF generation)
- eSignature workflow (provider integration)
- Signature tracking dashboards
- Family Portal (guided intake + sign links)
- Compliance Guardrails (rules engine + blockers)
- Audit Trail (immutable event log)
- Onboarding Wizard + “Concierge Mode” setup checklist
- Import & coexistence tools (CSV import + email-forward intake)

### 2.2 Out of Scope (explicitly NOT MVP)
- Full accounting / payments / trust accounting
- Cemetery plot mapping
- Pre-need trust management
- Website builder / public tribute pages
- Deep EDRS integrations (state-by-state)
- Advanced inventory forecasting
- Full scheduling/resource suite (keep minimal “service time + conflict warning”)

### 2.3 Product Principles
1. **Timeline-first**: everything relevant lives in the case
2. **One primary action per screen**
3. **Progressive disclosure**: show only what’s needed
4. **“Always know what’s missing”**: blockers are actionable and solvable quickly
5. **AI never acts silently**: propose → review → confirm
6. **Printer-perfect docs**: PDFs must match real-world needs
7. **Layer-first adoption**: usable without immediate migration

---

## 3) Personas & Roles

### 3.1 Personas
- **Owner/GM (Buyer/Admin):** wants reliability, compliance safety, visibility, low risk adoption
- **Director (Power user):** wants speed, fewer mistakes, easy signatures, clean docs
- **Office Admin (Ops user):** wants reminders, “what’s missing,” organized files, easy comms
- **Assistant/Staff:** needs tasks, checklists, simple updates
- **Family Member (Portal user):** wants simple, warm, guided intake, easy signing

### 3.2 Roles (RBAC)
- **Owner/Admin:** everything; manage rules/templates/users/locations/exports/integrations
- **Manager:** manage cases/templates/packs; cannot change org billing/security settings
- **Director:** create/edit cases; generate docs; send signatures; manage tasks
- **Staff:** view/edit assigned tasks, upload docs, update timeline steps
- **Read-only:** view cases/docs (e.g., accountant/consultant)
- **Family (tokenized):** portal-only, scoped per case

RBAC must be enforced server-side and reflected in UI (hide disabled actions).

---

## 4) Architecture (recommended for agent build)

### 4.1 Web stack (suggested)
- **Next.js (App Router) + TypeScript**
- **shadcn/ui + Tailwind CSS** (see design system file)
- **Database:** Postgres (Prisma ORM)
- **Auth:** NextAuth or Clerk (email/password + magic links)
- **Email:** Resend (transactional)
- **File storage:** S3-compatible (AWS S3 or R2)
- **PDF:** server-side generation (React-pdf or pdf-lib) + template rendering
- **Jobs:** background queue (BullMQ/Redis or Upstash QStash) for reminders, AI parsing, exports
- **AI:** provider abstraction (OpenAI/Anthropic/etc.), with strict PII handling

### 4.2 Key non-functional requirements
- **Security:** encryption at rest; secure signed URLs for downloads; least privilege access
- **Auditability:** immutable events; admin exports
- **Performance:** Today Board loads < 2s for orgs up to 5 locations, 2k cases
- **Reliability:** PDF + signature flows must be idempotent
- **Accessibility:** WCAG AA for internal app; family portal especially

---

## 5) Data Model (high level)

### 5.1 Core entities
- **Organization**
- **Location** (belongs to org)
- **User** (belongs to org; assigned locations optional)
- **Role / Permissions**
- **Case**
- **Person** (decedent, NOK, contacts; reusable across cases with linking)
- **CaseContactLink** (role in case: NOK, informant, purchaser, etc.)
- **Task** (assigned user, due date, status)
- **DocumentTemplate**
- **TemplatePack** (a set of templates + rules)
- **Document** (generated PDF or uploaded file, tagged)
- **SignatureRequest** (status, signers, provider IDs)
- **FamilyPortalSession** (token, expiry, permissions)
- **ComplianceRule** (condition + requirement)
- **Blocker** (computed; cached; references rule and missing item)
- **AuditEvent** (immutable log)
- **ImportJob** (CSV import status)
- **InboundEmail** (raw metadata, parsed attachments, linkage to case)

### 5.2 Case fields (MVP required)
- Case ID, location, assigned director
- Service type (burial/cremation/etc.)
- Service date/time (optional)
- Disposition (burial/cremation/transfer)
- Status: Draft / Active / Closed / Archived
- Stage: Intake / Arrangement / Documents / Signatures / Service / Disposition / Close
- Decedent: full name, DOB, DOD, place of death, address
- Primary NOK/purchaser contact
- Notes (structured + freeform)

### 5.3 Document tags (standardized enum)
- GPL
- Contract
- Authorization (cremation, embalming, disposition)
- Permit (burial transit)
- Death certificate worksheet
- ID / Verification
- Obituary / Program
- Internal checklist
- Other

---

## 6) Key Workflows (end-to-end)

### 6.1 Layer-first adoption workflow
**Goal:** customer can start using value features without migration.

1) Admin creates org + location(s)
2) Run onboarding wizard (upload GPL/price list, pick template pack, rules preset)
3) Add users/invite staff
4) Create cases via:
   - manual quick form
   - CSV import (minimal fields)
   - inbound email forwarding
5) Generate packet + send signature links
6) Track progress on Today Board
7) Close case only when blockers cleared

### 6.2 New case — “10-minute packet” workflow
1) Create case (manual or AI intake)
2) Confirm extracted fields + fill missing info checklist
3) Select “Arrangement Packet” template pack
4) Generate docs (PDFs) in one click
5) Send eSignature requests
6) Portal link sent to family to add obituary details + uploads
7) Case becomes Active and appears on Today Board

### 6.3 Compliance enforcement workflow
- Guardrails evaluate on:
  - stage change
  - disposition/service type change
  - document generation
  - signature status change
  - case close attempt
- Blockers show:
  - what’s missing
  - why (rule)
  - direct CTA to resolve (e.g., generate doc, request signature)

### 6.4 Close Case workflow
1) User clicks “Close Case”
2) System evaluates rules → if blockers exist, block close and show resolution actions
3) If clear, system locks editing (except admin override with reason) and marks Closed
4) Archive/export pack optionally generated

---

## 7) Functional Requirements by Module (with Acceptance Criteria)

### 7.1 Auth & Org
**Requirements**
- Email/password and/or magic link login (configurable)
- Invite users by email; set role
- User belongs to one org; optional location permissions

**Acceptance Criteria**
- Invited user cannot access org until invite accepted
- Role changes apply immediately (server-side check)

### 7.2 Onboarding Wizard (“Concierge Mode”)
**Steps**
1) Org basics + niche mode selection (cremation-first / multi-location / removal-heavy)
2) Locations setup
3) Staff invites + roles
4) Price list (GPL) upload (CSV) + editor
5) Template packs selection (starter library)
6) Compliance rules preset (recommended defaults)
7) Send first “family portal link” test (optional)

**Acceptance Criteria**
- Wizard progress saved; resumable
- Admin can skip advanced steps, but sees checklist to complete later

### 7.3 Today Board
**Views**
- My Tasks
- Today’s Services
- Blocked Cases
- Waiting on Family
- Waiting on Physician/ME (generic “waiting on external”)
- Upcoming (48h)

**Acceptance Criteria**
- Each card has primary action CTA
- Filters by location and assignment
- Loads < 2s for 500 active cases

### 7.4 Case Timeline
**Core UI**
- Header: case ID, decedent name, status, stage, assigned director, quick actions
- Timeline steps with completion states
- Tabs: Overview, People, Tasks, Documents, Signatures, Service, Disposition, Audit Log

**Acceptance Criteria**
- Editing within role permissions
- Stage changes trigger rules evaluation
- Timeline shows blockers inline

### 7.5 People & Contacts
**Requirements**
- Decedent + Contacts stored as Person entries
- Contacts can have roles within the case (NOK, purchaser, informant, etc.)
- Phone/email validation

**Acceptance Criteria**
- Editing decedent updates templates merge fields immediately (draft docs regenerate on demand)

### 7.6 Tasks
**Requirements**
- Create tasks: title, assignee, due date/time, priority, tags, linked stage
- Task templates per pack optional
- Task status: open, done, blocked

**Acceptance Criteria**
- Tasks appear on Today Board per assignee and due date
- Completion logged to audit trail

### 7.7 Document Engine
**Requirements**
- Templates: variable placeholders, conditional blocks, signature fields mapping
- Generate PDFs from templates (server-side)
- Uploaded docs stored and indexed per case
- Versioning: each generation creates new Document record

**Acceptance Criteria**
- Document generated from template uses latest confirmed case data
- Download uses signed URL with expiry
- Document tags drive compliance rules

### 7.8 Template Packs (Packet Factory)
**Requirements**
- Pack = ordered list of templates + optional tasks + recommended rules
- One-click “Generate Pack” produces PDFs and creates missing-doc blockers if generation fails

**Acceptance Criteria**
- Pack generation idempotent: retries do not duplicate unless user chooses “new version”
- Pack can be customized per org

### 7.9 eSignature
**Requirements**
- Provider abstraction interface (e.g., DocuSign/HelloSign)
- Create signature request for one or more docs
- Signer list with order and role
- Webhooks to update status

**Acceptance Criteria**
- Status updates reflect on case timeline within 60s
- Completed signed PDF stored as new Document version tagged “Signed”
- Missing signature blockers resolve automatically on completion

### 7.10 Family Portal
**Requirements**
- Tokenized access (magic link), scoped to one case
- Pages: Welcome, Intake Forms, Uploads, Review & Sign, Confirmation
- Warm theme (see design system)
- Form autosave and progress

**Acceptance Criteria**
- Family can complete forms without login
- Uploads stored and visible to staff instantly
- Portal cannot access internal staff data

### 7.11 Compliance Guardrails (Rules Engine)
**Rule types (MVP)**
- Required Document Tag exists (optionally “signed”)
- Required Signature Request completed
- Required Field(s) completed
- Consistency check passes (no critical mismatches)
- Stage gating (cannot advance or close)

**Condition builder (MVP)**
- IF disposition = cremation THEN require doc tag “Authorization” signed
- IF stage >= Arrangement THEN require GPL acknowledgement doc/signature
- IF transport scheduled THEN require permit tag “Permit”

**Acceptance Criteria**
- Blockers show reason and “Fix” CTA
- Admin override requires reason, logs audit event

### 7.12 Audit Trail
**Events logged**
- Case created/updated (key fields)
- Stage changes
- Document generated/uploaded/downloaded
- Signature request created/updated
- Portal link created/accessed (metadata)
- Compliance override
- User role changes
- Imports completed

**Acceptance Criteria**
- Audit events immutable
- Export to CSV/PDF (admin)

### 7.13 Imports & Inbound Email
**CSV Import**
- Cases minimal: location, decedent name, DOD, director, stage/status
- Contacts import optional
- Map columns UI

**Inbound Email Intake**
- Org has unique inbound address (e.g., intake+orgslug@domain)
- Parse subject/body/attachments
- Create “Draft Case” with linked InboundEmail record
- Optionally run AI extraction on content

**Acceptance Criteria**
- No data loss; raw email metadata preserved
- Attachments stored; user confirms before merging into case

### 7.14 Notifications
- Email notifications for signature requests, reminders
- In-app notifications for blockers, assignments
- Digest option (daily summary)

**Acceptance Criteria**
- User can mute non-critical notifications
- Blockers can trigger escalation reminders (configurable)

---

## 8) AI Requirements & Safety

### 8.1 AI modules
1) Intake Copilot: extract fields + missing info checklist
2) Document consistency checker: detect mismatches/blanks
3) Obituary/program drafter: fact-locked + approval

### 8.2 AI guardrails
- AI suggestions must be review-confirmed
- Show confidence per field and provenance (which note/doc it came from)
- Allow org-wide AI disable
- Data retention settings: delete transcripts/parsed text after N days
- Do not generate legal/medical advice; present as “data quality checks”

### 8.3 Acceptance Criteria
- No field auto-saved as “confirmed” without user confirmation
- AI output stored as suggestion with source references

---

## 9) Analytics (for product + customers)

### 9.1 Product analytics (internal)
- time-to-packet (median)
- cases created per week
- signature completion time
- blocker categories frequency
- onboarding completion rate

### 9.2 Customer analytics (in-app dashboard later)
MVP: keep minimal, but track:
- active cases
- overdue tasks
- blocked cases count
- signatures pending count

---

## 10) Success Metrics (MVP)
- 5 pilot homes onboarded
- < 30 minutes onboarding-to-first-case (with concierge mode)
- Median time-to-packet < 10 minutes in pilots
- 70%+ of cases use template packs + signatures tracking
- Low support burden after week 2 per customer

---

## 11) Open Questions / Decisions for build
- Choose eSignature provider
- Choose AI provider + data privacy posture
- PDF engine approach (react-pdf vs pdf-lib vs HTML-to-PDF)
- Multi-location permission model granularity
- Storage costs and retention policies

---

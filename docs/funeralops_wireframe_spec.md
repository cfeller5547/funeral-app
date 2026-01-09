# FuneralOps — Screen-by-Screen Wireframe Spec (MVP V2)
*Implementation-oriented UI spec for shadcn/ui + Tailwind*

> **Layout goal:** modern, minimal, “calm” UI. Staff should always know: *where am I, what’s next, what’s missing.*

---

## 1) Global App Shell

### 1.1 App Layout (internal)
- **Top Bar (fixed):**
  - Left: org/location switcher (combobox)
  - Center: global search (Command/K-bar)
  - Right: notifications bell, user menu
- **Left Sidebar (collapsible):**
  - Today
  - Cases
  - Documents
  - Families
  - Compliance
  - Settings (admin only)
- **Main Content Area:**
  - max width container on large screens, full-width tables allowed
  - breadcrumb header optional

**Components (shadcn)**
- `Sidebar` (custom using shadcn primitives), `Button`, `DropdownMenu`, `Command`, `Input`, `Badge`, `Separator`, `Tooltip`, `Toaster`

### 1.2 Global Search (Command palette)
Search across:
- cases (by decedent, case ID)
- people/contacts
- documents (title/tag)
- tasks

States:
- empty: “Type to search cases, contacts, docs…”
- results grouped with icons
- keyboard navigation

### 1.3 Status language (consistent)
- **Blocker (critical):** Brick Red badge “Blocked”
- **Pending:** Soft Aqua badge “Pending”
- **Ready:** Muted Green badge “Ready”

---

## 2) Public Site (minimal)

### 2.1 Landing
Sections:
- hero: one-liner + CTA “Request a pilot”
- 3 value pillars: Speed, Safety, Clarity
- screenshot strip (Today board, Case timeline, Packet factory)
- “How pilots work” 3 steps
- testimonials (later)
- footer (security/privacy)

### 2.2 Pricing
- 3 tiers cards
- FAQ
- CTA

### 2.3 Security/Privacy
- data handling overview
- AI toggle statement
- retention controls

### 2.4 Request Pilot / Book Demo
- form (name, org, locations, volume, current software)
- scheduling link

---

## 3) Auth

### 3.1 Sign In
- email + password OR magic link
- “forgot password”

### 3.2 Invite Acceptance
- show org name + role
- set password (if needed)

---

## 4) Onboarding Wizard (“Concierge Mode”)

Route: `/onboarding`
Progress steps sidebar + main panel.

### Step 1 — Org Basics
Fields:
- org name
- niche mode (radio): cremation-first / multi-location / removal-heavy / general
- timezone

### Step 2 — Locations
- add location cards (name, address, phone)
- optionally assign default location

### Step 3 — Staff
- invite user (email + role)
- list invited users table

### Step 4 — GPL/Price List Import
- upload CSV
- mapping UI: column selection (service name, price, category)
- inline editor table
- version name + effective date

### Step 5 — Template Pack Starter Library
- multi-select packs (Arrangement, Cremation Auth, Closing Pack)
- each pack card shows included templates + tasks

### Step 6 — Compliance Presets
- checkbox list of recommended rules (with explanation)
- “Apply preset”

### Step 7 — Send a Test Portal Link (optional)
- choose a test “dummy case” or skip
- show portal preview

**Wizard completion screen**
- “Create your first case” primary CTA
- “Review setup checklist” secondary

---

## 5) Today Board (Home)

Route: `/app/today`

### Layout
- header: location filter + “New Case” button
- grid sections:
  - My Tasks
  - Today’s Services
  - Blocked Cases
  - Waiting on Family
  - Waiting on External
  - Upcoming (48h)

### Card content (cases)
- decedent name + case ID
- stage pill
- blocker count
- next action button (contextual)
- small metadata (service date, assigned director)

### Empty states
- “No blocked cases 🎉”
- “No tasks due today”

### Interactions
- clicking card opens case timeline
- quick actions open modal/sheet:
  - “Request Signature” (Sheet)
  - “Generate Packet” (Dialog)

---

## 6) Cases

### 6.1 Case List
Route: `/app/cases`

Header:
- search (local)
- filters: location, status, stage, assigned director, service date range
- “New Case” button

Table (DataTable):
- Case ID
- Decedent
- Stage
- Status
- Assigned
- Service Date
- Blockers (badge count)
- Updated

Row actions:
- open case
- duplicate as template (admin)
- archive (admin)

### 6.2 New Case — Choose Creation Method
Route: `/app/cases/new`

3 options cards:
1) Quick Form (manual)
2) AI Intake (paste notes/upload docs)
3) Inbound Email (select from inbox queue)

CTA goes to respective flow.

---

## 7) New Case Flow — Quick Form (Manual)

Route: `/app/cases/new/manual`

Form sections (accordion):
- Basics: location, assigned director, case type/disposition, service date/time (optional)
- Decedent: name, DOB/DOD, address
- NOK/Purchaser: name, phone/email
- Notes (freeform)

Footer:
- primary: “Create Case”
- secondary: “Create & Generate Arrangement Packet” (opens pack selection)

After create:
- redirect to case timeline at “Intake” stage

---

## 8) New Case Flow — AI Intake Copilot

Route: `/app/cases/new/ai`

### Step A — Input
- text area: paste notes
- file uploader: docs/images (ID, forms)
- optional voice transcript upload (later)

CTA: “Extract Details”

### Step B — Review + Confirm
Two-column layout:
- left: AI suggestions form (editable fields with confidence + source chips)
- right: “Missing Info Checklist” (checkbox list) + “Questions to ask family”

Controls:
- “Accept All High-Confidence”
- “Review low-confidence”

CTA: “Create Case”

### Step C — Generate Packet
- select Template Pack (radio cards)
- CTA: “Generate Packet”
- option checkbox: “Send family portal link now”

---

## 9) Case Timeline (Core Screen)

Route: `/app/cases/[caseId]`

### Header (sticky within page)
- Decedent name + case ID
- Status + stage pills
- Assigned director avatar
- Blocker badge (red) with dropdown list
- Primary action button changes by stage:
  - Intake: “Generate Arrangement Packet”
  - Documents: “Request Signatures”
  - Close: “Close Case”

### Main layout
- left: timeline steps (vertical)
- right: stage panel content (changes per selected step)
- top secondary nav tabs:
  - Overview
  - People
  - Tasks
  - Documents
  - Signatures
  - Service
  - Disposition
  - Audit Log

#### 9.1 Intake Stage Panel
- “Case Basics” summary
- Confirm required fields
- Missing info checklist + quick “Send to family portal” action
- CTA: “Generate Arrangement Packet”

#### 9.2 Arrangement Stage Panel
- Pack selection summary
- price list items selected (if supported)
- note: MVP can keep pricing selection minimal; allow line-items later

#### 9.3 Documents Stage Panel
- Document pack list
- “Generate doc” button per template
- “Generate all” button for pack
- Document list with:
  - tag badge
  - status (draft/signed)
  - version drop-down
  - download/open

#### 9.4 Signatures Stage Panel
- Signature request list
- CTA: “New Signature Request”
- each request shows:
  - signers + status
  - reminders controls
  - “Copy signing link”

#### 9.5 Service Stage Panel (minimal MVP)
- service date/time + location/chapel (text)
- internal service checklist tasks
- conflict warning (simple): “Overlaps with Service #123”

#### 9.6 Disposition Stage Panel (basic)
- disposition type
- chain-of-custody checklist (manual toggles)
- required docs list

#### 9.7 Close Stage Panel
- “Close Case” CTA
- show blockers preventing close
- if no blockers:
  - confirm dialog with summary
  - optional: “Generate archive pack” checkbox

---

## 10) People Tab (Case)

Components:
- Decedent card
- Contacts list (table):
  - name, role, phone, email
  - actions: edit, set as primary contact
- Add contact (Dialog):
  - search existing people (combobox)
  - or create new

Empty state: “Add the purchaser / next-of-kin to enable portal + signatures.”

---

## 11) Tasks Tab (Case)

- Task list (sortable)
- New task (inline or dialog)
- Fields: title, due, assignee, stage, priority, tags
- Quick complete checkbox

Also show “Pack tasks” (auto-created from template pack)

---

## 12) Documents Module (Global)

Route: `/app/documents`

Tabs:
- Templates
- Packs
- Generated Docs (searchable)

### 12.1 Templates
List cards/table:
- template name
- tags
- updated date
- actions: edit, duplicate, archive

Template editor screen:
- left: fields palette (case fields)
- center: template body editor (rich text / markdown)
- right: preview PDF panel
- signature fields mapping UI
- save version notes

### 12.2 Packs
- list packs
- pack builder:
  - name
  - included templates (ordered)
  - associated tasks (optional)
  - recommended rules toggles
  - “Generate preview packet”

### 12.3 Generated Docs
Global table:
- case, doc name, tag, status, created, actions

---

## 13) Families Module (Global)

Route: `/app/families`

Table:
- case
- portal status (not sent / in progress / completed)
- last activity
- signatures pending count
- actions: resend link, view responses

---

## 14) Compliance Center

Route: `/app/compliance`

Tabs:
- Blocked Cases
- Rules
- Reports/Exports
- Audit Exports

### 14.1 Blocked Cases
Table:
- case
- blocker count
- top blocker reason
- action: “Fix” (deep links to relevant case tab)

### 14.2 Rules
List rules with:
- condition summary
- requirement summary
- enabled toggle
- “edit” modal with condition builder (MVP simplified forms)

### 14.3 Reports/Exports
- export blocked cases (CSV)
- export audit logs (CSV)
- export “case close pack” summary (PDF) (optional)

---

## 15) Settings

Route: `/app/settings`

Sections:
- Organization & Billing (placeholder)
- Locations
- Users & Roles
- Price Lists / GPL versions
- Notifications
- Integrations (email + eSignature + storage)
- Branding

### Price List/GPL
- list versions with effective date
- set active version
- download PDF preview
- “Require GPL acknowledgement before Arrangement stage” toggle (ties to rules)

---

## 16) Family Portal (Warm Theme)

Route: `/f/[token]` (no login)

Pages:
1) Welcome
2) About the deceased (facts form)
3) Obituary prompts + draft preview
4) Participants
5) Upload photos
6) Review documents
7) Sign documents
8) Confirmation

UX:
- progress stepper
- autosave
- clear privacy messaging
- mobile-first

Components: `Card`, `Form`, `Input`, `Textarea`, `Stepper` (custom), `FileUploader`, `Button`, `Alert`

---

## 17) System States & Error Handling (global)
- Loading: skeletons
- Empty: friendly but professional copy
- Errors: actionable messages
- Offline-ish: at minimum, handle retry for doc generation/signature creation

Idempotency:
- Pack generation: prevent duplicates on retry
- Signature request creation: avoid duplicate provider envelopes

---

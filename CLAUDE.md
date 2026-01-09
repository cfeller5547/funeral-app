# FuneralOps - Project Context for Claude

> **North Star:** First call → compliant, ready-for-arrangement packet in < 10 minutes, with zero missing signatures/docs, and no case can be closed unless essentials are satisfied.

---

## Quick Reference

| Item | Value |
|------|-------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| UI | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (credentials + magic links) |
| Primary Color | Deep Teal `#006D77` / `oklch(0.45 0.12 180)` |
| Run Dev | `npm run dev` |
| Build | `npm run build` |
| DB Push | `npx prisma db push` |
| AI Provider | Google Gemini (1.5 Flash/Pro) |

---

## 1. Project Overview

FuneralOps is a cloud-based case management system for independent funeral homes (1-5 locations). It provides:

- **Case Management**: Stage-based workflow from intake to close
- **Document Engine**: Template packs + PDF generation + e-signatures
- **Compliance Guardrails**: Rules engine that blocks case progression until requirements are met
- **Family Portal**: Token-based access for families to provide information and sign documents
- **Today Board**: Daily operations dashboard

### Target Users
- **Owner/Admin**: Full access, manages org settings, compliance rules
- **Director**: Creates/manages cases, generates documents, sends signatures
- **Staff**: Assigned tasks, updates timeline
- **Family (Portal)**: Token-only access, warm/calm UI

### Real-World Workflow Assumptions

The app is optimized for these realities of funeral home operations:

1. **Staff is interrupted constantly** - Phone calls, walk-ins, and urgent requests are the norm. The app must support quick context-switching and resuming work.

2. **Most work originates from phone calls, paper, and PDFs** - Information arrives unstructured. AI features help transform this chaos into structured case data.

3. **People print everything** - Documents must be print-ready and well-formatted. PDF generation is critical.

4. **Data errors are common and expensive** - Wrong dates, misspelled names, and missing signatures cause real problems. Validation and compliance guardrails prevent costly mistakes.

5. **Families are grieving** - The family portal must be calm, warm, and patient. Large touch targets, autosave, and gentle guidance are essential.

6. **Compliance is non-negotiable** - State regulations require specific documents before cremation, burial, or transport. The system must block progression until requirements are met.

7. **Staff works across multiple cases** - The Today Board provides at-a-glance visibility into what needs attention now.

---

## 2. Tech Stack

```
├── Next.js 14+ (App Router)
├── TypeScript (strict mode)
├── Tailwind CSS + shadcn/ui components
├── Prisma ORM + PostgreSQL
├── NextAuth.js (authentication)
├── Google Gemini AI (1.5 Flash for speed, 1.5 Pro for OCR)
├── Lucide React (icons)
├── React Hook Form + Zod (forms/validation)
├── pdf-lib (PDF generation)
└── Docker (local PostgreSQL)
```

---

## 3. Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   └── app/
│   │       ├── today/      # Today Board (dashboard)
│   │       ├── cases/      # Case list, [caseId] detail, new
│   │       ├── documents/  # Templates, packs, generated docs
│   │       ├── families/   # Family portal management
│   │       ├── compliance/ # Blocked cases, rules
│   │       └── settings/   # Org settings
│   ├── (auth)/             # Auth routes (login)
│   ├── (portal)/           # Family portal (public, token-based)
│   │   └── f/[token]/      # Portal steps
│   ├── api/                # API routes
│   ├── onboarding/         # Onboarding wizard
│   └── page.tsx            # Landing page (public)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # AppShell, Sidebar, TopBar
│   ├── today/              # TodayBoard
│   ├── cases/              # CaseList, CaseTimeline, NewCaseForm, AIIntakeWizard
│   ├── documents/          # Templates, Packs, DocumentList, SmartUpload
│   ├── signatures/         # SignatureRequestSheet
│   ├── portal/             # Family portal components
│   ├── onboarding/         # Onboarding wizard steps
│   ├── landing/            # Marketing landing page
│   ├── ops-triage/         # OpsTriageCopilot (FAB)
│   ├── inbox/              # EmailInbox
│   └── shared/             # StatusBadge, EmptyState
├── lib/
│   ├── auth/config.ts      # NextAuth configuration
│   ├── db/index.ts         # Prisma client
│   ├── compliance/engine.ts # Compliance rules evaluation
│   ├── pdf/generator.ts    # PDF generation
│   ├── signatures/         # Signature provider abstraction
│   ├── storage/            # S3/R2/Local file storage
│   ├── ai/                 # Gemini AI integrations
│   │   ├── gemini.ts       # Gemini client setup
│   │   ├── intake-parser.ts # AI Intake Copilot
│   │   ├── document-analyzer.ts # OCR + Smart Filing
│   │   ├── ops-triage.ts   # Ops Triage Copilot
│   │   ├── email-parser.ts # Inbound email parsing
│   │   └── index.ts        # Exports
│   └── utils.ts            # Utility functions
└── types/index.ts          # Shared TypeScript types
```

---

## 4. Design System

### 4.1 Color Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Teal | `#006D77` | Primary buttons, active nav, links |
| Background | Pale Ice | `#EDF6F9` | Main app background |
| Card | White | `#FFFFFF` | Cards, modals, panels |
| Text | Ink Blue | `#2B2D42` | Primary text |
| Muted | Slate | `#64748B` | Secondary text, labels |
| Secondary | Soft Aqua | `#83C5BE` | Secondary buttons, highlights |
| Destructive | Brick Red | `#BC4749` | **ONLY for compliance blockers** |
| Success | Muted Green | `#6A994E` | Completed states |
| Portal BG | Warm Cream | `#FFFAF0` | Family portal only |

### 4.2 Color Rules

- **Brick Red (`#BC4749`) is ONLY for blocking compliance issues** - never for generic errors
- Use `text-muted-foreground` for secondary text
- Form validation errors should be subtle, not panic red
- Family Portal uses warm cream background for calm, reassuring feel

### 4.3 Component Patterns

```tsx
// Primary button
<Button className="bg-primary text-primary-foreground">Action</Button>

// Card
<Card className="bg-card border border-border rounded-lg shadow-sm">

// Status badges
<Badge variant="destructive">Blocked</Badge>  // Only for compliance
<Badge className="bg-emerald-100 text-emerald-700">Ready</Badge>
<Badge className="bg-amber-100 text-amber-700">Pending</Badge>
<Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
```

### 4.4 Typography

- Font: Inter (system default)
- `text-xs`: Labels, metadata
- `text-sm`: Form labels, helper text
- `text-base`: Body text
- `text-lg`: Section headers
- `text-xl`: Page titles
- `text-2xl+`: Marketing/hero only

### 4.5 Spacing

- Page padding: `p-4` (mobile) / `p-6` (desktop)
- Section spacing: `space-y-6`
- Within cards: `space-y-3`
- Max content width: ~1200px (forms), full width (tables)

---

## 5. Database Schema (Key Models)

### Core Entities

```prisma
Organization -> Location[] -> User[]
                           -> Case[]

Case -> Person (decedent)
     -> CaseContact[] (NOK, purchaser, etc.)
     -> Task[]
     -> Document[]
     -> SignatureRequest[]
     -> Blocker[]
     -> FamilyPortalSession[]
```

### Enums Reference

```typescript
// Case workflow stages (in order)
CaseStage: INTAKE | ARRANGEMENT | DOCUMENTS | SIGNATURES | SERVICE | DISPOSITION | CLOSE

// Case status
CaseStatus: DRAFT | ACTIVE | CLOSED | ARCHIVED

// User roles (descending permissions)
UserRole: OWNER | ADMIN | MANAGER | DIRECTOR | STAFF | READONLY

// Compliance
RuleSeverity: BLOCKER | WARNING
RequirementType: DOCUMENT_EXISTS | DOCUMENT_SIGNED | FIELD_COMPLETED | SIGNATURE_COMPLETED
ConditionType: ALWAYS | DISPOSITION_EQUALS | SERVICE_TYPE_EQUALS | STAGE_GTE | STAGE_EQUALS | FIELD_PRESENT

// Organization niche
NicheMode: GENERAL | CREMATION_FIRST | MULTI_LOCATION | REMOVAL_HEAVY
```

---

## 6. Key Patterns

### 6.1 API Routes

```typescript
// Pattern: /app/api/[resource]/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... fetch data
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  // ... create/update
}
```

### 6.2 Server Components (Pages)

```typescript
// Pattern: Data fetching in server components
export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const data = await prisma.model.findMany({
    where: { organizationId: session.user.organizationId }
  })

  return <ClientComponent data={data} />
}
```

### 6.3 Compliance Engine

```typescript
// Blockers are created/resolved by the compliance engine
// See: src/lib/compliance/engine.ts

// Blocker has: message, fixAction, fixUrl, rule.severity
// Severity is on the rule, NOT the blocker directly
```

### 6.4 Family Portal

```typescript
// Token-based access (no login required)
// Route: /f/[token]/...
// Steps: welcome -> about -> obituary -> participants -> uploads -> review -> sign -> confirmation
// Theme: Warm cream background, large touch targets (44px min)
```

---

## 7. AI Features (Gemini)

FuneralOps uses Google Gemini AI for intelligent automation.

### 7.1 AI Intake Copilot

**Location:** `/app/cases/new/ai` + `AIIntakeWizard` component

Extracts case data from unstructured notes (phone calls, emails, faxes):
- Decedent info (name, dates, demographics)
- Next-of-kin and purchaser details
- Service preferences
- Missing information flagged for follow-up
- Questions to ask family

```typescript
// API: POST /api/ai/intake
// Input: { notes: string, images?: { data, mimeType }[] }
// Output: ExtractedCaseData with confidence scores
```

### 7.2 OCR + Smart Filing

**Location:** Documents page → "Smart Upload" tab + `SmartUpload` component

Upload documents and AI automatically:
- Identifies document type (death cert, contract, cremation auth, etc.)
- Suggests appropriate tag from DocumentTag enum
- Extracts key data (decedent name, dates, signatures)
- Matches to existing cases
- Flags compliance relevance

```typescript
// API: POST /api/ai/analyze-document
// Input: { documents: [{ imageData, mimeType, filename }] }
// Output: DocumentAnalysis[] with suggestedTag, extractedData, complianceRelevance
```

### 7.3 Ops Triage Copilot

**Location:** Floating action button (purple sparkles) on Today Board

Converts phone calls, voicemails, emails into actionable tasks:
- Extracts tasks with priority and due dates
- Suggests assignees (Director, Admin, Current User)
- Identifies status updates for cases
- Flags case information that needs updating
- Urgency classification (IMMEDIATE, HIGH, NORMAL, LOW)

```typescript
// API: POST /api/ai/triage
// Input: { message: string, source: string, caseId?: string }
// Output: { tasks, statusUpdates, caseUpdates, urgencyLevel, summary }
```

### 7.4 Email Parser (Inbound Email → Case)

**Location:** Today Board → Email Inbox + `/api/webhooks/inbound-email`

Parses incoming emails and extracts case information:
- Identifies if email is a new case request
- Extracts decedent and contact information
- Detects urgency level (HIGH, NORMAL, LOW)
- Finds references to existing cases
- Generates action recommendations

```typescript
// API: POST /api/webhooks/inbound-email (from email provider)
// API: GET /api/inbound-emails (list pending emails)
// API: POST /api/inbound-emails/[id]/create-case (convert to case)
```

### 7.5 Gemini Configuration

```typescript
// src/lib/ai/gemini.ts
// Flash model: Fast responses for intake, triage, email parsing
geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// Pro model: Complex OCR, document analysis
geminiProModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
```

---

## 8. Feature Status

### Completed ✅
- [x] Authentication (NextAuth, credentials + magic links)
- [x] App Shell (sidebar, top bar, command menu)
- [x] Today Board (dashboard with tasks, services, blockers, email inbox)
- [x] Case Management (list, timeline, 7-stage workflow)
- [x] Documents Module (templates, packs, PDF generation)
- [x] Signatures (mock provider with webhook lifecycle, request flow)
- [x] Compliance Engine (rules, blockers, admin overrides)
- [x] Family Portal (8-step wizard, token-based)
- [x] Onboarding Wizard (6-step setup)
- [x] Settings (organization, price lists)
- [x] Landing Page (marketing, hero with product mockup)
- [x] AI Intake Copilot (paste notes → extract case data)
- [x] OCR + Smart Filing (upload docs → AI auto-tags)
- [x] Ops Triage Copilot (notes/calls → tasks)
- [x] Price List / GPL Management (version control, CSV import)
- [x] File Storage (S3/R2/local provider abstraction)
- [x] Inbound Email → Draft Case (AI parsing, inbox queue)

### Not Yet Implemented
- [ ] Full audit log exports
- [ ] Real e-signature provider integration (DocuSign, etc.)
- [ ] Email notifications (Resend)
- [ ] Multi-tenancy isolation improvements
- [ ] Advanced reporting/analytics

---

## 9. Common Tasks

### Adding a New Page

```bash
# 1. Create the page
src/app/(app)/app/[feature]/page.tsx

# 2. Add to sidebar navigation
src/components/layout/sidebar.tsx
```

### Adding a New API Route

```bash
# Create route file
src/app/api/[resource]/route.ts

# With dynamic params
src/app/api/[resource]/[id]/route.ts
```

### Adding a shadcn Component

```bash
npx shadcn@latest add [component-name]
```

### Database Changes

```bash
# 1. Edit schema
prisma/schema.prisma

# 2. Push changes (dev)
npx prisma db push

# 3. Generate client
npx prisma generate
```

---

## 10. Important Conventions

### DO
- Use `oklch()` or hex colors from the design system
- Use shadcn/ui components from `@/components/ui`
- Fetch data in server components, pass to client components
- Use Zod for form validation
- Check session in API routes before any operations
- Use `redirect()` from next/navigation for server-side redirects

### DON'T
- Use Brick Red for anything except compliance blockers
- Create new color values outside the design system
- Fetch data in client components when it can be server-side
- Skip auth checks in API routes
- Use `window.location` for navigation (use Next.js router)

### Naming Conventions
- Components: PascalCase (`CaseTimeline.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- API routes: kebab-case folders (`/api/compliance-rules/`)
- Database: snake_case (handled by Prisma)

---

## 11. Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# AI (Gemini)
GEMINI_API_KEY="..."  # Google AI Studio key

# File Storage (optional - defaults to local)
STORAGE_PROVIDER="local"  # or "s3" or "r2"
LOCAL_STORAGE_PATH="./uploads"
S3_BUCKET="..."
S3_REGION="..."
S3_ENDPOINT="..."  # For R2 or other S3-compatible
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."

# Optional (for future features)
RESEND_API_KEY="..."
```

---

## 12. Running the Project

```bash
# Start PostgreSQL (Docker)
docker-compose up -d

# Install dependencies
npm install

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 13. Reference Docs

Full specifications are in `/docs/`:
- `funeralops_mvp_prd.md` - Complete PRD with scope, personas, features
- `funeralops_wireframe_spec.md` - Screen-by-screen UI specifications
- `funeralops_design_system_starter.md` - Design tokens and component rules

---

## 14. Quick Fixes Reference

### Common Prisma Errors

```typescript
// Wrong: Blocker doesn't have severity directly
blocker.severity  // ❌

// Right: Severity is on the rule
blocker.rule.severity  // ✅

// Wrong: Old field names
blocker.description  // ❌
blocker.message      // ✅
```

### Type Mismatches

```typescript
// When dealing with unknown types from Prisma JSON fields
Boolean(value)  // For boolean context
String(value)   // For string context
```

---

*Last updated: January 2025*

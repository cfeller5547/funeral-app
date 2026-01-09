# FuneralOps MVP

A modern funeral home workflow and compliance management system built with Next.js 14, TypeScript, and Google Gemini AI.

## Features

### Core Features
- **Case Management** - Complete lifecycle from intake to close with 7-stage workflow
- **Today Board** - At-a-glance dashboard showing tasks, services, blockers, and pending items
- **Document Generation** - PDF templates with merge fields and signature mappings
- **Template Packs** - One-click generation of complete document sets
- **Family Portal** - Token-based portal for families to submit information
- **Compliance Engine** - Rule-based system that prevents non-compliant case closures
- **Price List / GPL Management** - Full price list versioning with CSV import/export
- **Multi-location Support** - Manage multiple funeral home locations
- **Audit Trail** - Complete immutable log of all case activities

### AI Features (Gemini)
- **AI Intake Copilot** - Paste unstructured notes, extract case data automatically
- **OCR + Smart Filing** - Upload documents, AI suggests tags and extracts metadata
- **Ops Triage Copilot** - Convert call notes/messages into structured tasks
- **Inbound Email Parser** - Emails automatically analyzed and converted to draft cases

### Infrastructure
- **File Storage** - Abstracted storage (Local/S3/R2) with signed URLs
- **Signature Webhooks** - Mock signature provider with full lifecycle events
- **Demo Mode** - Seeded data for testing all features

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with email/password and magic links
- **AI**: Google Gemini (Flash 1.5 & Pro 1.5)
- **Storage**: Local filesystem / AWS S3 / Cloudflare R2
- **Signatures**: Mock provider (interface for DocuSign/HelloSign integration)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/cfeller5547/funeral-app.git
cd funeral-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/funeral_app?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here-generate-with-openssl"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key-here"

# Storage (choose one provider)
STORAGE_PROVIDER="local"  # Options: local, s3, r2

# For Local Storage (default)
STORAGE_LOCAL_PATH="./uploads"

# For S3 Storage (optional)
# S3_BUCKET="your-bucket-name"
# S3_REGION="us-east-1"
# S3_ACCESS_KEY_ID="your-access-key"
# S3_SECRET_ACCESS_KEY="your-secret-key"

# For Cloudflare R2 Storage (optional)
# S3_BUCKET="your-r2-bucket"
# S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
# S3_ACCESS_KEY_ID="your-r2-access-key"
# S3_SECRET_ACCESS_KEY="your-r2-secret-key"

# Email (optional - for testing inbound email feature)
# SENDGRID_API_KEY="your-sendgrid-api-key"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Start PostgreSQL with Docker

```bash
cd docker
docker-compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `funeral_app`
- User: `postgres`
- Password: `postgres`

### 5. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data (optional)
npx prisma db seed
```

### 6. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Demo Login

After seeding, you can log in with:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `password123`

**Funeral Director Account:**
- Email: `director@demo.com`
- Password: `password123`

## Testing Features

### 1. AI Intake Copilot
1. Navigate to "New Case" → "AI Intake" tab
2. Paste sample notes:
   ```
   Call from Jane Smith about her father John Smith who passed away yesterday.
   Date of death: March 15, 2024. He was 78 years old.
   Jane's phone: 555-0123, email: jane@example.com
   They want cremation with a small memorial service.
   ```
3. Click "Extract Case Data" → Review → "Create Case"

### 2. OCR + Smart Filing
1. Open any case → "Documents" tab
2. Click "Upload Document" or drag & drop
3. AI analyzes and suggests tags (Death Certificate, ID, etc.)
4. Accept or modify tags, click "Save"

### 3. Ops Triage Copilot
1. Click the floating action button (bottom-right) on Today Board
2. Paste a note like: "Need to call the florist about the casket spray for Smith case. Also remind director to review the obituary draft."
3. AI extracts tasks with assignments and priorities

### 4. Inbound Email → Case
1. Navigate to Today Board
2. View "Email Inbox" section (shows pending emails)
3. Click an email to see AI analysis
4. Click "Create New Case" to convert email to draft case

### 5. Document Generation
1. Open a case → "Documents" tab
2. Select a template (e.g., "General Price List")
3. Click "Generate" → PDF is created with case data merged
4. Click "Request Signatures" to send for signing

### 6. Compliance Blockers
1. Navigate to "Compliance" in sidebar
2. View "Rules" tab, enable rules (e.g., "Cremation Authorization Required")
3. Try to close a case without meeting requirements
4. See blockers appear on Today Board and case page

### 7. Family Portal
1. Open a case → "Family Portal" tab
2. Click "Generate Portal Link"
3. Open link in incognito window (no login required)
4. Complete the family questionnaire
5. Data syncs back to case automatically

### 8. Price Lists
1. Navigate to "Settings" → "Price Lists"
2. Create a new price list or duplicate existing
3. Add items manually or import CSV
4. Format: `Name, Price, Category, Description`
5. Activate a price list to make it current

## Project Structure

```
funeral-app-v2/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed/                  # Demo data
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, signup, invite pages
│   │   ├── (app)/            # Main app (protected routes)
│   │   │   ├── today/        # Today Board dashboard
│   │   │   ├── cases/        # Case management
│   │   │   ├── documents/    # Templates & packs
│   │   │   ├── compliance/   # Rules & blockers
│   │   │   └── settings/     # Organization, locations, users, price lists
│   │   ├── (portal)/         # Family portal (public, token-based)
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth
│   │   │   ├── cases/        # Case CRUD
│   │   │   ├── ai/           # AI endpoints (intake, triage, OCR)
│   │   │   ├── documents/    # PDF generation, downloads
│   │   │   ├── signatures/   # Signature requests
│   │   │   ├── inbound-emails/ # Email processing
│   │   │   ├── price-lists/  # GPL management
│   │   │   ├── storage/      # File uploads
│   │   │   └── webhooks/     # Signature & email webhooks
│   │   └── onboarding/       # First-time setup wizard
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # App shell, sidebar, topbar
│   │   ├── cases/            # Case cards, timeline, panels
│   │   ├── documents/        # Template editor, pack generator
│   │   ├── signatures/       # Request forms, status displays
│   │   ├── portal/           # Family portal components
│   │   ├── ai/               # AI wizards and copilots
│   │   ├── inbox/            # Email inbox component
│   │   └── shared/           # Reusable components
│   ├── lib/
│   │   ├── auth/             # NextAuth configuration
│   │   ├── db/               # Prisma client
│   │   ├── pdf/              # PDF generation
│   │   ├── signatures/       # Signature provider (mock)
│   │   ├── storage/          # File storage (local/S3/R2)
│   │   ├── compliance/       # Compliance engine
│   │   └── ai/               # Gemini AI integrations
│   └── types/                # TypeScript types
├── docker/
│   └── docker-compose.yml    # PostgreSQL container
└── docs/                     # Additional documentation
```

## Database Management

### View database in Prisma Studio
```bash
npx prisma studio
```

### Reset database (WARNING: deletes all data)
```bash
npx prisma migrate reset
```

### Create a new migration
```bash
npx prisma migrate dev --name description-of-change
```

## Building for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Environment-Specific Notes

### Local Development
- Uses local filesystem for file storage (`./uploads` folder)
- Mock signature provider simulates DocuSign/HelloSign
- PostgreSQL runs in Docker

### Production Deployment
- Set `STORAGE_PROVIDER=s3` or `STORAGE_PROVIDER=r2`
- Configure real signature provider (DocuSign, HelloSign)
- Use managed PostgreSQL (AWS RDS, Supabase, etc.)
- Set secure `NEXTAUTH_SECRET`
- Configure email provider webhooks for inbound emails

## Troubleshooting

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
cd docker && docker-compose logs postgres

# Restart PostgreSQL
cd docker && docker-compose restart
```

### Prisma client issues
```bash
# Regenerate Prisma client
npx prisma generate
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

### Missing Gemini API key
- Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Add to `.env` as `GEMINI_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.

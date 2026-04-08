# ShiftHire

**AI-powered candidate sourcing that turns a job description into a ranked LinkedIn shortlist in under 5 minutes.**

ShiftHire automates the full recruitment sourcing pipeline — from reading your JD, generating precision search queries with Gemini AI, scanning live LinkedIn profiles via Exa, evaluating each candidate, and returning a scored, ranked shortlist with written reasoning. No LinkedIn Recruiter licence required.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Billing & Credits](#billing--credits)
- [Architecture](#architecture)
- [AI Pipeline](#ai-pipeline)
- [Security & Privacy](#security--privacy)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Gemini AI Query Generation** — reads your JD end-to-end and constructs semantic search queries that capture nuanced requirements beyond simple keyword matching.
- **LinkedIn Deep Search** — scans millions of live LinkedIn profiles via Exa's semantic search engine, surfacing candidates who genuinely fit the role.
- **Automated AI Evaluation** — every candidate is scored 0–100, assigned a match band (Strong / Good / Below), and given bullet-point reasoning. No black box.
- **Real-Time Progress Tracking** — a live processing screen walks through each pipeline step as it runs: query generation → LinkedIn search → save → evaluate → rank.
- **Up to 50 Candidates per Search** — configurable via a slider (5–50), at 10 credits per job match.
- **CSV Export** — one-click export of your entire ranked shortlist including names, LinkedIn URLs, match scores, bands, and AI reasoning — ready for any ATS.
- **Credit-Based Billing** — Free tier (100 credits), Pro ($29/mo), Enterprise ($99/mo), and one-time credit packs.
- **Admin Panel** — user stats, job counts, and generated search query visibility for administrators.
- **GDPR Compliant** — no candidate data stored beyond session, no third-party data sharing, anonymous-only analytics.

---

## How It Works

1. **Create account & sign in** — 100 free credits included, no card required.
2. **Click "New Job"** — opens a fresh job match form in your dashboard.
3. **Paste your job description** — include role, required skills, tech stack, seniority. Skip company name/branding.
4. **Set the location** — format: `City, Country` (e.g. `London, UK` or `Berlin, Germany`).
5. **Choose experience level** — Entry / Mid / Senior / Lead.
6. **Submit** — ShiftHire runs the full AI pipeline automatically. Results arrive in 2–3 minutes.

### Pipeline Steps

```
WAITING → GENERATING_QUERY → SEARCHING_LINKEDIN → SAVING_CANDIDATES
       → EVALUATING_CANDIDATES → RANKING_RESULTS → DONE
```

Each step is tracked in real time with a progress percentage displayed on screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI |
| Database | PostgreSQL via [Prisma](https://www.prisma.io/) ORM |
| Auth & DB hosting | [Supabase](https://supabase.com/) |
| Async job queue | [Inngest](https://www.inngest.com/) |
| AI model | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| LinkedIn search | [Exa](https://exa.ai/) (`exa-js`) |
| Payments | [DodoPayments](https://dodopayments.com/) (`dodopayments`) |
| Validation | [Zod](https://zod.dev/) |
| UI components | Radix UI (Dialog, Select, Slider, Toast, Label) |
| Icons | Lucide React |

---

## Project Structure

```
shifthire/
├── prisma/
│   └── seed.ts                    # DB seed script
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing / marketing page
│   │   ├── layout.tsx             # Root layout with fonts & providers
│   │   ├── globals.css            # Global styles, animations, dark theme tokens
│   │   ├── login/                 # Login page & form
│   │   ├── register/              # Register page & form
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Dashboard — job list, stats, filters, pagination
│   │   │   ├── layout.tsx         # Dashboard shell with sidebar
│   │   │   ├── new/page.tsx       # New job match form
│   │   │   ├── billing/page.tsx   # Billing & credits page
│   │   │   └── jobs/[jobId]/
│   │   │       └── page.tsx       # Job detail — processing screen + results table
│   │   ├── admin/page.tsx         # Admin panel
│   │   └── api/
│   │       ├── auth/              # Login, register, logout routes
│   │       ├── jobs/              # List jobs, get job, create job, status, results
│   │       ├── billing/           # Checkout + Dodo webhook
│   │       ├── user/              # Get current user + credits
│   │       ├── admin/stats/       # Admin stats endpoint
│   │       └── inngest/route.ts   # Inngest event handler
│   ├── components/
│   │   ├── sidebar.tsx            # Dashboard sidebar navigation
│   │   ├── shifthire-logo.tsx     # Brand logo component
│   │   ├── faq-section.tsx        # Landing page FAQ accordion
│   │   ├── cookie-banner.tsx      # GDPR cookie consent banner
│   │   └── ui/                    # Shared UI primitives (Button, Badge, Card, etc.)
│   ├── hooks/
│   │   ├── use-job-progress.ts    # Real-time job progress polling hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── inngest/
│   │   ├── client.ts              # Inngest client setup
│   │   └── functions/
│   │       └── job-processor.ts   # Full AI pipeline function (6 steps)
│   ├── lib/
│   │   ├── auth.ts                # Session/auth helpers
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── gemini.ts              # Google Gemini client
│   │   ├── exa.ts                 # Exa search client
│   │   ├── utils.ts               # cn() and general utilities
│   │   ├── errors.ts              # Typed error helpers
│   │   ├── billing/credits.ts     # Credit deduction logic
│   │   ├── supabase/              # Supabase client, server, admin helpers
│   │   └── validations/job.ts     # Zod schema for job creation
│   ├── services/
│   │   ├── query-generator.ts     # Gemini: JD → search query
│   │   ├── exa-search.ts          # Exa: query → LinkedIn profiles
│   │   └── candidate-evaluator.ts # Gemini: profile + JD → score + reasoning
│   ├── types/
│   │   └── api.ts                 # Shared API response types
│   ├── generated/prisma/          # Auto-generated Prisma client types
│   └── middleware.ts              # Auth middleware (protects /dashboard, /api)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or a Supabase project)
- API keys for: Google Gemini, Exa, Supabase, Inngest, DodoPayments

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Exa (LinkedIn search)
EXA_API_KEY="your-exa-api-key"

# Inngest (async job queue)
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# DodoPayments (billing)
DODO_API_KEY="your-dodo-api-key"
DODO_WEBHOOK_SECRET="your-dodo-webhook-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

```bash
git clone https://github.com/YashAnkleshwariya/swifthire.git
cd swifthire
npm install
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# (Optional) Seed initial data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### Running Locally

```bash
# Start Next.js dev server
npm run dev

# In a separate terminal — start Inngest dev server
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000).

The Inngest dev server runs at [http://localhost:8288](http://localhost:8288) and handles background job processing.

---

## Usage Guide

### Creating a Job Match

1. Sign in to your dashboard.
2. Click **New Job Match** in the top-right.
3. Fill in the form:
   - **Job Description** (required, min 50 chars) — paste the full JD. Omit company name and branding.
   - **Location** — `City, Country` format. Examples: `Toronto, Canada`, `Singapore`, `Remote — APAC`.
   - **Experience Level** — Entry / Mid / Senior / Lead (optional but recommended).
   - **Number of Candidates** — use the slider to pick 5–50 (default: 20).
4. Click **Find Matching Candidates**. The pipeline starts immediately.

### Reading the Results

Each candidate in the results table shows:

| Column | Description |
|---|---|
| Rank | Overall position (1 = best match) |
| Name | Linked directly to their LinkedIn profile |
| Title | Their current/most recent job title |
| Location | Where they are based |
| Match % | 0–100 AI match score |
| Band | **above_70** (Strong) / **50_to_70** (Good) / **below_50** (Below) |

Click **Details** on any row to see the full **Why Matched** reasoning from the AI.

### Filtering & Sorting

- Use the **Min match %** input to hide low-scoring candidates.
- Click **Match %** or **#** column headers to sort ascending/descending.
- Use status filter tabs on the dashboard (All / Pending / Processing / Completed / Failed).

### Exporting

Click **Export CSV** to download a spreadsheet containing: Rank, Name, LinkedIn URL, Title, Location, Match Score, Match Band, Why Matched reasoning.

---

## API Reference

All API routes require authentication (session cookie) except register/login.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | List jobs (paginated, filterable by status) |
| `POST` | `/api/jobs/create` | Create a new job match (costs 10 credits) |
| `GET` | `/api/jobs/[jobId]` | Get a single job |
| `GET` | `/api/jobs/[jobId]/status` | Get processing status + progress |
| `GET` | `/api/jobs/[jobId]/results` | Get job + ranked candidate list |

#### `POST /api/jobs/create` — Request Body

```json
{
  "description": "string (50–10,000 chars, required)",
  "location": "string (optional) — e.g. London, UK",
  "experienceLevel": "Entry | Mid | Senior | Lead (optional)",
  "candidateLimit": "number 5–50 (optional, default 20)"
}
```

Response: `{ jobId: string }`

### User

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user` | Get current user (email, name, credits, isAdmin) |

### Billing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/billing/checkout` | Start checkout session for a plan or credit pack |
| `POST` | `/api/billing/webhook` | DodoPayments webhook handler (internal) |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide user and job stats (admin only) |

---

## Billing & Credits

Every account starts with **100 free credits**. Each job match costs **10 credits**.

| Plan | Price | Credits | Job Matches |
|---|---|---|---|
| Free | $0 | 100 (one-time on signup) | 10 |
| Pro | $29/mo | 300/mo | 30/mo |
| Enterprise | $99/mo | 1,000/mo | 100/mo |
| Credits Pack | $9 one-time | +100 credits | +10 matches |

Credits are deducted at job creation time. Payments are processed via DodoPayments; webhooks handle credit fulfillment automatically.

---

## Architecture

```
Browser (Next.js App Router)
│
├── /dashboard/*       → Client components polling /api/* every 3–5s during processing
├── /api/*             → Next.js API route handlers (auth, jobs, billing, user)
│
Inngest Event Bus
│
└── job/process event  → processJob function (runs server-side, outside request cycle)
    ├── Step 1: fetch-and-start        Mark PROCESSING in DB
    ├── Step 2: generate-query         Gemini AI → search string
    ├── Step 3: search-linkedin        Exa API → raw LinkedIn profiles
    ├── Step 4: save-candidates        Insert candidates into DB
    ├── Step 5: evaluate-candidate-N   Gemini AI per candidate → score + reasoning
    └── Step 6: rank-and-complete      Sort by score, write ranks, mark COMPLETED
```

Progress updates are written to the `ProcessingJob` table after each step. The frontend polls `/api/jobs/[jobId]/status` every 3 seconds to display live progress.

### Database Models

| Model | Purpose |
|---|---|
| `User` | Account, email, hashed password, credits, isAdmin |
| `Job` | Job post — description, location, level, status, searchQuery |
| `Candidate` | LinkedIn profile data — name, URL, title, location, exaScore |
| `Evaluation` | AI result per candidate — matchScore, matchBand, whyMatched[] |
| `ProcessingJob` | Real-time pipeline state — currentStep, progress %, timestamps |
| `CreditTransaction` | Credit debit/credit ledger per user |

---

## AI Pipeline

### 1. Query Generation (`src/services/query-generator.ts`)

Uses **Google Gemini** to read the full job description and synthesise an optimised natural-language search query. The generated query is stored on the `Job` record (visible to admins).

### 2. LinkedIn Search (`src/services/exa-search.ts`)

Uses **Exa's** semantic search to scan live LinkedIn profiles using the generated query. Returns candidates with name, URL, profile text, current title, location, and a relevance score.

### 3. Candidate Evaluation (`src/services/candidate-evaluator.ts`)

For each candidate, calls **Google Gemini** with the candidate's profile text and the original job description. Returns:

- `matchScore` — integer 0–100
- `matchBand` — `above_70` (Strong) / `50_to_70` (Good) / `below_50` (Below)
- `whyMatched` — array of bullet-point strings explaining the match reasoning

### 4. Ranking

Candidates are sorted descending by `matchScore`. Their `rank` field is updated in the database (rank 1 = highest score). The final shortlist is returned ordered by rank.

---

## Security & Privacy

- **Authentication** — session-cookie-based auth via Supabase. Protected routes enforced in `src/middleware.ts`.
- **Rate limiting & bot protection** — applied at the API layer to prevent brute-force attacks and abuse.
- **HTTP security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options set on all responses.
- **No candidate data retention** — profiles are fetched and stored only for the life of the job result. No long-term candidate database is built.
- **No third-party data sharing** — LinkedIn profile data fetched via Exa is never sold or shared with third parties.
- **GDPR compliant** — anonymous-only analytics (Umami). Cookie consent banner on first visit. EU data residency.
- **Admin-only endpoints** — `/api/admin/*` routes verify `isAdmin` flag before returning any data.

---

## Deployment

ShiftHire is a standard Next.js 14 application. It deploys to any Node.js-compatible host.

### Vercel (recommended)

```bash
vercel deploy
```

Set all environment variables in the Vercel project settings. The Inngest Vercel integration handles background function execution automatically via the `/api/inngest` route.

### Other platforms

Ensure the host supports:
- Long-running API routes (for the Inngest webhook handler at `/api/inngest`)
- Persistent environment variables
- A connected PostgreSQL database

### Post-deploy checklist

- [ ] Run `prisma migrate deploy` in the production environment
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Register DodoPayments webhook URL: `https://your-domain.com/api/billing/webhook`
- [ ] Register Inngest app URL: `https://your-domain.com/api/inngest`
- [ ] Confirm Supabase RLS policies are active

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following the existing style: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request against `master`

Please follow the existing conventions: TypeScript strict mode, no untyped `any`, Zod validation at all API boundaries, Tailwind for all styling.

---

## License

Private — all rights reserved.  
Contact [ankleshwariyayash@gmail.com](mailto:ankleshwariyayash@gmail.com) for licensing enquiries.

---

Built with Next.js · Gemini AI · Exa · Inngest · Supabase · Prisma

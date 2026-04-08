# ShiftHire

**AI-powered candidate sourcing that turns a job description into a ranked LinkedIn shortlist in under 5 minutes.**

ShiftHire automates the full recruitment sourcing pipeline — from reading your JD, generating precision search queries with Gemini AI, scanning live LinkedIn profiles, evaluating each candidate, and returning a scored, ranked shortlist with written reasoning. No LinkedIn Recruiter licence required.

---


## Features

- **Gemini AI Query Generation** — reads your JD end-to-end and constructs semantic search queries that capture nuanced requirements beyond simple keyword matching.
- **LinkedIn Deep Search** — scans millions of live LinkedIn profiles using semantic matching, surfacing candidates who genuinely fit the role.
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

## Security & Privacy

- **Authentication** — session-cookie-based auth via Supabase. Protected routes enforced in `src/middleware.ts`.
- **Rate limiting & bot protection** — applied at the API layer to prevent brute-force attacks and abuse.
- **HTTP security headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options set on all responses.
- **No candidate data retention** — profiles are fetched and stored only for the life of the job result. No long-term candidate database is built.
- **No third-party data sharing** — LinkedIn profile data is never sold or shared with third parties.
- **GDPR compliant** — anonymous-only analytics (Umami). Cookie consent banner on first visit. EU data residency.
- **Admin-only endpoints** — `/api/admin/*` routes verify `isAdmin` flag before returning any data.

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

Built with Next.js · Gemini AI · Inngest · Supabase · Prisma

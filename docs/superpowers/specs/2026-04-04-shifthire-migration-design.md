# ShiftHire Migration Design
**Date:** 2026-04-04
**Approach:** Big Bang (single implementation cycle)
**Status:** Approved

## Overview

Migrate the existing LinkedIn Profile Matcher app to **ShiftHire** — rebranded, deployed on Vercel, with Supabase (DB + Auth), Inngest (background jobs), Dodo Payments, and Umami Cloud analytics.

No production users exist, so a clean-break migration is safe and preferred.

---

## Architecture

```
GitHub Repo
    │
    ▼ (auto-deploy on push)
Vercel (Next.js 14)
    ├── App UI (React / Tailwind)
    ├── API Routes (/api/*)
    └── Inngest Handler (/api/inngest)
         │
         ├──► Supabase
         │     ├── PostgreSQL (jobs, candidates, credits)
         │     └── Auth (users, sessions, password reset)
         │
         ├──► Inngest Cloud
         │     └── job-processor function (replaces BullMQ + Redis worker)
         │           ├── Gemini AI (query generation + evaluation)
         │           └── Exa.ai (LinkedIn search)
         │
         ├──► Dodo Payments
         │     ├── Checkout sessions (hosted payment page)
         │     └── Webhooks → /api/billing/webhook
         │
         └──► Umami Cloud
               └── Script tag in layout.tsx (pageview tracking)
```

**Packages removed:** `bullmq`, `ioredis`, `jose`, `bcryptjs`
**Packages added:** `@supabase/supabase-js`, `@supabase/ssr`, `inngest`, `dodopayments`

---

## 1. Database & Auth (Supabase)

### Prisma Schema Changes

The `User` model is simplified — Supabase Auth owns identity. The app DB stores only app-specific data, linked by Supabase Auth UUID.

```prisma
model User {
  id        String   @id  // Supabase Auth UUID — set by Auth, not @default
  name      String?
  isAdmin   Boolean  @default(false)
  credits   Int      @default(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  jobs               Job[]
  creditTransactions CreditTransaction[]
}
```

**Removed from schema:**
- `password` field on `User`
- `PasswordResetToken` model (Supabase Auth handles password reset natively)

**Supabase connection (two URLs required):**
```
DATABASE_URL    # Pooled connection — used by Prisma at runtime on Vercel
DIRECT_URL      # Direct connection — used only for prisma migrate
```

### Auth Flow

- **Login:** `supabase.auth.signInWithPassword()` — sets secure HTTP-only cookie session
- **Register:** `supabase.auth.signUp()` → on success, also create a `User` row in the app DB with the returned Auth UUID
- **Logout:** `supabase.auth.signOut()`
- **Forgot/Reset password:** Supabase Auth handles email delivery — no custom routes needed
- **Middleware:** `@supabase/ssr` middleware refreshes sessions automatically on every request
- **API auth:** All routes call `supabase.auth.getUser()` instead of `verifySession()`

### Files Removed
- `src/lib/session.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/login/forgot-password/page.tsx`
- `src/app/login/reset-password/[token]/page.tsx`

### Files Updated
- `src/middleware.ts` → Supabase SSR session refresh
- `src/lib/auth.ts` → `requireUser()` uses `supabase.auth.getUser()`
- `src/lib/prisma.ts` → add `directUrl` to datasource
- `src/app/api/auth/login/route.ts` → Supabase sign in
- `src/app/api/auth/register/route.ts` → Supabase sign up + create User row
- `src/app/api/auth/logout/route.ts` → Supabase sign out
- `prisma/schema.prisma` → simplified User model

### New Env Vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # Used server-side to create the User row in the app DB on registration (bypasses RLS)
DATABASE_URL
DIRECT_URL
```

---

## 2. Background Jobs (Inngest)

### What Changes
The standalone worker process (`src/workers/job-processor.ts`) and BullMQ + Redis are removed. An Inngest function served from a Next.js API route replaces them.

### Flow
1. User creates a job → `src/app/api/jobs/create/route.ts` calls `inngest.send("job/process", { jobId })`
2. Inngest receives the event and runs the function on its cloud infrastructure
3. Each step is a durable checkpoint — if a step fails, only that step retries
4. Progress updates still write to the `ProcessingJob` table as before

### New File Structure
```
src/
  inngest/
    client.ts                    # Inngest client singleton
    functions/
      job-processor.ts           # Ported from src/workers/job-processor.ts
  app/
    api/
      inngest/
        route.ts                 # Inngest handler (GET + POST)
```

### Job Processor Steps (maps 1:1 from old worker)
```
step.run("generate-query")       → generateSearchQuery()
step.run("search-linkedin")      → searchLinkedInProfiles()
step.run("save-candidates")      → prisma.candidate.createMany()
step.run("evaluate-candidates")  → evaluateCandidate() × N (batched, concurrency 3)
step.run("rank-results")         → sort + prisma.candidate.update() ranks
```

### Files Removed
- `src/workers/job-processor.ts`
- `src/lib/queue.ts`
- `src/lib/redis.ts`

### Files Updated
- `src/app/api/jobs/create/route.ts` → `inngest.send(...)` replaces `queue.add(...)`
- `package.json` → remove `bullmq`, `ioredis`; add `inngest`

### New Env Vars
```
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
```

---

## 3. Dodo Payments

### Flow
1. User clicks a plan → POST `/api/billing/checkout` → Dodo checkout session created → user redirected to Dodo hosted page
2. Payment succeeds → Dodo redirects to `/dashboard/billing?success=true`
3. Dodo sends webhook to `/api/billing/webhook` → `payment.succeeded` event → `addCredits()` called

### Checkout
```ts
const dodo = new DodoPayments({ bearerToken: process.env.DODO_API_KEY });

const payment = await dodo.payments.create({
  customer: { email: user.email, name: user.name },
  product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
});
// return payment.payment_link to client for redirect
```

### Webhook
- Verify Dodo webhook signature using `DODO_WEBHOOK_SECRET`
- On `payment.succeeded`: extract `userId` from the payment metadata (passed at checkout creation time), call `addCredits(userId, plan.credits, source)`
- Using `userId` from metadata (not email lookup) avoids ambiguity if a user changes their email

### Checkout metadata (pass userId so webhook can resolve the user)
```ts
const payment = await dodo.payments.create({
  customer: { email: user.email, name: user.name },
  product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
  metadata: { userId: user.id, planId },
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
});
```

### Pricing (updated with Dodo product IDs)
> **Note:** `dodo_prod_xxx/yyy/zzz` are placeholders. Create products in the Dodo dashboard first, then replace these values with the real product IDs before deploying.

```ts
export const PRICING = {
  FREE:        { credits: 100,  price: 0,  dodoProductId: null },
  PRO:         { credits: 300,  price: 29, dodoProductId: "dodo_prod_xxx" },
  ENTERPRISE:  { credits: 1000, price: 99, dodoProductId: "dodo_prod_yyy" },
  CREDITS_100: { credits: 100,  price: 9,  dodoProductId: "dodo_prod_zzz" },
}
```

### Files Updated
- `src/app/api/billing/checkout/route.ts` → Dodo checkout session
- `src/app/api/billing/webhook/route.ts` → Dodo webhook + signature verification
- `src/lib/billing/credits.ts` → update PRICING with dodoProductId

### New Env Vars
```
DODO_API_KEY
DODO_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## 4. Umami Analytics

Single script tag added to root layout. No other code changes required.

```tsx
// src/app/layout.tsx
<Script
  defer
  src="https://cloud.umami.is/script.js"
  data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
/>
```

Tracks pageviews, referrers, and device stats automatically.

### New Env Var
```
NEXT_PUBLIC_UMAMI_WEBSITE_ID
```

---

## 5. Rename + UI Refresh

### Rename to ShiftHire
| File | Change |
|---|---|
| `package.json` | `"name": "shifthire"` |
| `src/app/layout.tsx` | metadata title: "ShiftHire", description updated |
| `src/components/sidebar.tsx` | Logo + app name → ShiftHire |
| `src/app/login/page.tsx` | ShiftHire branding, tagline |
| `src/app/register/page.tsx` | ShiftHire branding |

### UI Improvements (within existing Radix UI + Tailwind stack)
| Area | Improvement |
|---|---|
| Login / Register | ShiftHire logo, tagline, polished card layout |
| Sidebar | App name prominent, cleaner active state |
| Dashboard | Status badges, empty state with "Create your first job" CTA |
| New Job form | Helper text on each field, clearer step progression |
| Billing page | Card-based pricing layout, recommended plan highlighted |
| Job results | Candidate cards with visual match score indicator |

No new UI libraries — all changes use existing Radix UI components and Tailwind.

---

## Environment Variables Summary

### Remove
```
SESSION_SECRET
REDIS_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Add
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL

# Inngest
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY

# Dodo Payments
DODO_API_KEY
DODO_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL

# Umami
NEXT_PUBLIC_UMAMI_WEBSITE_ID
```

---

## Deployment (GitHub → Vercel)

1. Push repo to GitHub
2. Connect GitHub repo to Vercel (import project)
3. Add all env vars in Vercel dashboard
4. Vercel auto-deploys on every push to `main`
5. Register Inngest app URL in Inngest dashboard: `https://shifthire.vercel.app/api/inngest`
6. Register Dodo webhook URL: `https://shifthire.vercel.app/api/billing/webhook`
7. Register Umami website, copy website ID to env var

---

## Files Deleted (complete list)
- `src/lib/session.ts`
- `src/lib/queue.ts`
- `src/lib/redis.ts`
- `src/workers/job-processor.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/login/forgot-password/page.tsx`
- `src/app/login/reset-password/[token]/page.tsx`

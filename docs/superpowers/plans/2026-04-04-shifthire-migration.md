# ShiftHire Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the LinkedIn Profile Matcher app to ShiftHire — rebranded on Vercel with Supabase (DB + Auth), Inngest (background jobs), Dodo Payments, and Umami Cloud analytics.

**Architecture:** Next.js 14 on Vercel with Supabase PostgreSQL + Auth replacing the custom JWT system. Inngest replaces BullMQ + Redis for durable background job processing. Dodo Payments replaces the Stripe stub.

**Tech Stack:** Next.js 14, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Prisma + `@prisma/adapter-pg`, Inngest, Dodo Payments (`dodopayments`), Umami Cloud, Tailwind CSS, Radix UI.

---

## File Map

### New Files
- `src/lib/supabase/server.ts` — server-side Supabase client (reads cookies via `next/headers`)
- `src/lib/supabase/client.ts` — browser-side Supabase client
- `src/inngest/client.ts` — Inngest client singleton
- `src/inngest/functions/job-processor.ts` — durable job processor (replaces worker)
- `src/app/api/inngest/route.ts` — Inngest handler endpoint

### Modified Files
- `package.json` — add/remove packages, rename to shifthire
- `prisma/schema.prisma` — simplified User model, directUrl, remove PasswordResetToken
- `src/lib/prisma.ts` — add directUrl datasource support
- `src/middleware.ts` — Supabase SSR session refresh + route protection
- `src/lib/auth.ts` — `requireUser()` via `supabase.auth.getUser()` (no req param)
- `src/app/api/auth/login/route.ts` — Supabase `signInWithPassword`
- `src/app/api/auth/register/route.ts` — Supabase `signUp` + create User row
- `src/app/api/auth/logout/route.ts` — Supabase `signOut`
- `src/app/api/jobs/route.ts` — `requireUser()` (no req)
- `src/app/api/jobs/create/route.ts` — `requireUser()` + `inngest.send()`
- `src/app/api/jobs/[jobId]/route.ts` — `requireUser()` (no req)
- `src/app/api/jobs/[jobId]/results/route.ts` — `requireUser()` (no req)
- `src/app/api/jobs/[jobId]/status/route.ts` — `requireUser()` (no req)
- `src/app/api/user/route.ts` — `requireUser()` (no req)
- `src/app/api/billing/checkout/route.ts` — Dodo checkout session
- `src/app/api/billing/webhook/route.ts` — Dodo webhook + signature verification
- `src/lib/billing/credits.ts` — add `dodoProductId` to PRICING
- `src/app/layout.tsx` — Umami script, ShiftHire metadata
- `src/components/sidebar.tsx` — ShiftHire branding
- `src/app/login/page.tsx` — ShiftHire branding
- `src/app/register/page.tsx` — ShiftHire branding
- `src/app/api/admin/stats/route.ts` — `requireAdmin()` (no req)

### Deleted Files
- `src/lib/session.ts`
- `src/lib/queue.ts`
- `src/lib/redis.ts`
- `src/workers/job-processor.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/login/forgot-password/page.tsx`
- `src/app/login/reset-password/[token]/page.tsx`

---

## Task 1: Update Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove old packages and add new ones**

```bash
cd d:/Claude/Project1
npm uninstall bullmq ioredis jose bcryptjs @types/bcryptjs
npm install @supabase/supabase-js @supabase/ssr inngest dodopayments
```

- [ ] **Step 2: Rename app in package.json**

Open `package.json` and change line 2:
```json
"name": "shifthire",
```

- [ ] **Step 3: Verify install succeeded**

```bash
npm ls @supabase/supabase-js @supabase/ssr inngest dodopayments
```

Expected: all four packages listed with version numbers, no `UNMET PEER DEPENDENCY` errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap dependencies — supabase, inngest, dodopayments in; bullmq, redis, jose, bcrypt out"
```

---

## Task 2: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Note on email field:** We keep `email` on the `User` model as a cached copy synced from Supabase Auth at registration time. This avoids needing to call Supabase Auth on every query that needs the user's email (admin panel, billing webhook, etc.).

- [ ] **Step 1: Replace the full contents of `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ProcessingStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}

model User {
  id        String   @id  // Supabase Auth UUID — set by Auth, not @default
  email     String   @unique  // cached from Supabase Auth for app queries
  name      String?
  isAdmin   Boolean  @default(false)
  credits   Int      @default(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  jobs               Job[]
  creditTransactions CreditTransaction[]
}

model Job {
  id                   String    @id @default(cuid())
  userId               String
  user                 User      @relation(fields: [userId], references: [id])
  title                String
  description          String    @db.Text
  location             String?
  experienceLevel      String?
  candidateLimit       Int       @default(10)
  status               JobStatus @default(PENDING)
  searchQuery          String?   @db.Text
  totalCandidatesFound Int       @default(0)
  creditsUsed          Int       @default(1)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  candidates    Candidate[]
  processingJob ProcessingJob?

  @@index([userId])
  @@index([status])
}

model Candidate {
  id           String      @id @default(cuid())
  jobId        String
  job          Job         @relation(fields: [jobId], references: [id], onDelete: Cascade)
  name         String
  linkedinUrl  String
  profileText  String?     @db.Text
  profileTitle String?
  location     String?
  workHistory  Json?
  exaScore     Float?
  rank         Int?
  createdAt    DateTime    @default(now())
  evaluation   Evaluation?

  @@index([jobId])
}

model Evaluation {
  id          String    @id @default(cuid())
  candidateId String    @unique
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  matchScore  Float
  matchBand   String
  whyMatched  Json?
  evaluatedAt DateTime  @default(now())
}

model ProcessingJob {
  id          String           @id @default(cuid())
  jobId       String           @unique
  job         Job              @relation(fields: [jobId], references: [id], onDelete: Cascade)
  status      ProcessingStatus @default(QUEUED)
  currentStep String?
  progress    Int              @default(0)
  error       String?          @db.Text
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model CreditTransaction {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount    Int
  type      String   // "PURCHASE" | "DEDUCT" | "REFUND"
  jobId     String?
  source    String?
  createdAt DateTime @default(now())

  @@index([userId])
}
```

- [ ] **Step 2: Run Prisma generate to update the client**

```bash
npx prisma generate
```

Expected: `✔ Generated Prisma Client` with no errors.

- [ ] **Step 3: Commit schema change (migration runs after Supabase is configured)**

```bash
git add prisma/schema.prisma src/generated/
git commit -m "chore: simplify User model for Supabase Auth, add directUrl, remove PasswordResetToken"
```

---

## Task 3: Update lib/prisma.ts

**Files:**
- Modify: `src/lib/prisma.ts`

The current file uses `PrismaPg` adapter, which is correct for Supabase's pooled connection. No change needed to the adapter logic — just verify `DATABASE_URL` is the pooled URL (Supabase port 6543) at runtime.

- [ ] **Step 1: Replace `src/lib/prisma.ts`**

```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient>;
};

function createPrismaClient() {
  // DATABASE_URL must be the Supabase pooled connection string (port 6543)
  // DIRECT_URL (port 5432) is used only by prisma migrate — set in schema.prisma
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "chore: document Supabase pooled vs direct URL usage in prisma client"
```

---

## Task 4: Create Supabase Client Helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

- [ ] **Step 1: Create `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies — middleware handles refresh
          }
        },
      },
    }
  );
}
```

- [ ] **Step 2: Create `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add Supabase server and browser client helpers"
```

---

## Task 5: Update Middleware

**Files:**
- Modify: `src/middleware.ts`

The new middleware uses `@supabase/ssr` to refresh the Supabase session on every request, then applies the same route-protection logic as before. The in-memory rate limiter is removed (it was already broken on Vercel's multi-instance environment — use Vercel's built-in rate limiting or a Redis-backed solution if needed in future).

- [ ] **Step 1: Replace the full contents of `src/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  // Create Supabase client that can refresh the session via cookie mutation
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST be called before any redirect/auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // --- API routes ---
  if (pathname.startsWith("/api/")) {
    // Inngest and billing webhook are public (called by external services)
    if (
      pathname.startsWith("/api/inngest") ||
      pathname.startsWith("/api/billing/webhook") ||
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/logout") ||
      pathname.startsWith("/api/auth/register")
    ) {
      return response;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "AUTHENTICATION_ERROR" },
        { status: 401 }
      );
    }

    return response;
  }

  // --- Page routes ---

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // isAdmin check happens inside the page/API handler (DB lookup needed)
    return response;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts/).*)" ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: replace custom JWT middleware with Supabase SSR session refresh"
```

---

## Task 6: Update lib/auth.ts

**Files:**
- Modify: `src/lib/auth.ts`

`requireUser` no longer takes a `req` parameter — Supabase SSR reads cookies via `next/headers`. All callers must be updated too (handled in Task 10).

- [ ] **Step 1: Replace the full contents of `src/lib/auth.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import { AuthenticationError, AuthorizationError } from "./errors";
import prisma from "./prisma";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      isAdmin: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("You must be logged in to access this resource");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new AuthorizationError("Admin access required");
  }
  return user;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: requireUser() reads Supabase session via next/headers, drops req param"
```

---

## Task 7: Update Auth API Routes

**Files:**
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/auth/register/route.ts`
- Modify: `src/app/api/auth/logout/route.ts`
- Delete: `src/lib/session.ts`
- Delete: `src/app/api/auth/forgot-password/route.ts`
- Delete: `src/app/api/auth/reset-password/route.ts`
- Delete: `src/app/login/forgot-password/page.tsx`
- Delete: `src/app/login/reset-password/[token]/page.tsx`

- [ ] **Step 1: Replace `src/app/api/auth/login/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      throw new AuthenticationError("Email and password are required");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new AuthenticationError("Invalid email or password");
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Replace `src/app/api/auth/register/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { handleApiError, ValidationError } from "@/lib/errors";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const supabase = await createClient();

    // Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email: validated.email.toLowerCase(),
      password: validated.password,
      options: {
        data: { name: validated.name.trim() },
      },
    });

    if (error || !data.user) {
      throw new ValidationError(error?.message ?? "Registration failed");
    }

    // Create app User row linked to the Supabase Auth UUID
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: validated.email.toLowerCase(),
        name: validated.name.trim(),
        credits: 100,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: validated.name.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: { message: string }[] };
      return NextResponse.json(
        {
          success: false,
          error: zodError.issues[0]?.message ?? "Validation failed",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Replace `src/app/api/auth/logout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Update `src/app/login/login-form.tsx` — remove forgot-password link and fix redirect**

The forgot-password page is being deleted. Also fix the post-login redirect: the new login API doesn't return `isAdmin`, so always redirect to `/dashboard`.

Replace the password label block (lines 66–76) — remove the `Forgot password?` link:
```tsx
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Password
        </label>
```

Replace the post-login redirect logic (the `router.push` lines inside the try block):
```ts
      const redirect = searchParams.get("redirect");
      router.push(redirect ?? "/dashboard");
```

- [ ] **Step 5: Delete old auth files**

```bash
rm src/lib/session.ts
rm src/app/api/auth/forgot-password/route.ts
rm src/app/api/auth/reset-password/route.ts
rm -rf src/app/login/forgot-password
rm -rf "src/app/login/reset-password"
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: any errors only about missing env vars or deleted imports — resolve them before continuing. No errors about session.ts (it's deleted).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: replace custom JWT auth routes with Supabase Auth signIn/signUp/signOut"
```

---

## Task 8: Update Login/Register Page Branding (Supabase-compatible)

The login form currently submits to `/api/auth/login`. Supabase SSR sets the session cookie automatically when `signInWithPassword` is called on the server — no change needed to the form submission flow. But update branding (full UI refresh in Task 18).

**Files:**
- No code changes needed in this task — the login/register forms still POST to the same API routes which now use Supabase.

- [ ] **Step 1: Smoke test login flow locally (requires Supabase project to be set up)**

Prerequisites: Create a Supabase project, copy the credentials, add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:5432/postgres
```

- [ ] **Step 2: Run Prisma migration against Supabase**

```bash
npx prisma migrate dev --name init_supabase
```

Expected: Migration applied successfully. Prisma uses `DIRECT_URL` for this.

- [ ] **Step 3: Test register then login in browser**

```bash
npm run dev
```

Go to `http://localhost:3000/register`, create an account, verify redirect to `/dashboard`.
Go to `http://localhost:3000/login`, sign in, verify redirect to `/dashboard`.
Check Supabase dashboard → Authentication → Users — the new user should appear.
Check Supabase dashboard → Table Editor → User — the app User row should exist with the same UUID.

---

## Task 9: Update All API Routes (Remove req from requireUser)

All routes that call `requireUser(req)` or `requireAdmin(req)` must drop the `req` argument — the new `requireUser()` reads cookies via `next/headers`.

**Files:**
- Modify: `src/app/api/jobs/route.ts`
- Modify: `src/app/api/jobs/[jobId]/route.ts`
- Modify: `src/app/api/jobs/[jobId]/results/route.ts`
- Modify: `src/app/api/jobs/[jobId]/status/route.ts`
- Modify: `src/app/api/user/route.ts`
- Modify: `src/app/api/billing/checkout/route.ts` (also updated in Task 13)
- Modify: `src/app/api/admin/stats/route.ts`

- [ ] **Step 1: Replace `src/app/api/jobs/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
    const status = url.searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          location: true,
          experienceLevel: true,
          status: true,
          totalCandidatesFound: true,
          createdAt: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Replace `src/app/api/jobs/[jobId]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";
import { refundCredits } from "@/lib/billing/credits";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      include: { processingJob: true },
    });

    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("You do not have access to this job");
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const job = await prisma.job.findUnique({ where: { id: params.jobId } });

    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("You do not have access to this job");
    }

    if (job.status === "PENDING") {
      await refundCredits(user.id, job.creditsUsed, job.id);
    }

    await prisma.job.delete({ where: { id: params.jobId } });

    return NextResponse.json({
      success: true,
      refunded: job.status === "PENDING" ? job.creditsUsed : 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Replace `src/app/api/jobs/[jobId]/results/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const baseSelect = {
      id: true,
      title: true,
      location: true,
      status: true,
      totalCandidatesFound: true,
      createdAt: true,
    };

    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      select: user.isAdmin ? { ...baseSelect, searchQuery: true } : baseSelect,
    });

    if (!job) throw new NotFoundError("Job not found");

    const candidates = await prisma.candidate.findMany({
      where: { jobId: params.jobId },
      orderBy: { rank: "asc" },
      include: { evaluation: true },
    });

    return NextResponse.json({ success: true, job, candidates });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 4: Replace `src/app/api/jobs/[jobId]/status/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const processingJob = await prisma.processingJob.findUnique({
      where: { jobId: params.jobId },
      select: {
        status: true,
        currentStep: true,
        progress: true,
        error: true,
        startedAt: true,
        completedAt: true,
        job: { select: { userId: true } },
      },
    });

    if (!processingJob) throw new NotFoundError("Processing job not found");

    if (processingJob.job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("Access denied");
    }

    return NextResponse.json({
      status: processingJob.status,
      currentStep: processingJob.currentStep,
      progress: processingJob.progress,
      error: processingJob.error,
      startedAt: processingJob.startedAt,
      completedAt: processingJob.completedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 5: Replace `src/app/api/user/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 6: Replace `src/app/api/admin/stats/route.ts`**

```ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalJobs,
      completedJobs,
      failedJobs,
      processingJobs,
      totalCandidates,
      recentJobs,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.job.count({ where: { status: "FAILED" } }),
      prisma.job.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
      prisma.candidate.count(),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          totalCandidatesFound: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          createdAt: true,
          _count: { select: { jobs: true } },
        },
      }),
    ]);

    const avgScore = await prisma.evaluation.aggregate({
      _avg: { matchScore: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        completedJobs,
        failedJobs,
        processingJobs,
        totalCandidates,
        avgMatchScore: Math.round(avgScore._avg.matchScore ?? 0),
        recentJobs,
        recentUsers,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/
git commit -m "feat: update all API routes to use requireUser() without req parameter"
```

---

## Task 10: Set Up Inngest

**Files:**
- Create: `src/inngest/client.ts`
- Create: `src/app/api/inngest/route.ts`
- Create: `src/inngest/functions/job-processor.ts`

- [ ] **Step 1: Create `src/inngest/client.ts`**

```ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "shifthire" });
```

- [ ] **Step 2: Create `src/app/api/inngest/route.ts`**

```ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processJob } from "@/inngest/functions/job-processor";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processJob],
});
```

- [ ] **Step 3: Create `src/inngest/functions/job-processor.ts`**

This ports the logic from `src/workers/job-processor.ts` to durable Inngest steps. Each `step.run()` is a checkpoint — retried independently on failure.

```ts
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { generateSearchQuery } from "@/services/query-generator";
import { searchLinkedInProfiles } from "@/services/exa-search";
import { evaluateCandidate } from "@/services/candidate-evaluator";

export const processJob = inngest.createFunction(
  { id: "process-job", retries: 3 },
  { event: "job/process" },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // Step 1: Mark job as processing and fetch it
    const job = await step.run("fetch-and-start", async () => {
      const j = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
      await prisma.job.update({ where: { id: jobId }, data: { status: "PROCESSING" } });
      await prisma.processingJob.update({
        where: { jobId },
        data: { status: "PROCESSING", startedAt: new Date() },
      });
      return j;
    });

    // Step 2: Generate search query via Gemini
    const searchQuery = await step.run("generate-query", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "GENERATING_QUERY", progress: 10 },
      });
      const query = await generateSearchQuery({
        jobDescription: job.description,
        location: job.location ?? undefined,
        experienceLevel: job.experienceLevel ?? undefined,
      });
      await prisma.job.update({ where: { id: jobId }, data: { searchQuery: query } });
      return query;
    });

    // Step 3: Search LinkedIn profiles via Exa
    const exaCandidates = await step.run("search-linkedin", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "SEARCHING_LINKEDIN", progress: 30 },
      });
      return searchLinkedInProfiles(searchQuery, job.candidateLimit);
    });

    // No candidates found — complete early
    if (exaCandidates.length === 0) {
      await step.run("complete-empty", async () => {
        await prisma.job.update({
          where: { id: jobId },
          data: { status: "COMPLETED", totalCandidatesFound: 0 },
        });
        await prisma.processingJob.update({
          where: { jobId },
          data: {
            status: "COMPLETED",
            currentStep: "NO_CANDIDATES_FOUND",
            progress: 100,
            completedAt: new Date(),
          },
        });
      });
      return;
    }

    // Step 4: Save candidates to DB
    const savedCandidates = await step.run("save-candidates", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "SAVING_CANDIDATES", progress: 40 },
      });
      return Promise.all(
        exaCandidates.map((c) =>
          prisma.candidate.create({
            data: {
              jobId,
              name: c.name,
              linkedinUrl: c.linkedinUrl,
              profileText: c.profileText,
              profileTitle: c.profileTitle,
              location: c.location,
              workHistory: c.workHistory
                ? JSON.parse(JSON.stringify(c.workHistory))
                : undefined,
              exaScore: c.exaScore,
            },
          })
        )
      );
    });

    // Step 5: Evaluate each candidate (one step per candidate for granular retries)
    const evaluations: { candidateId: string; score: number }[] = [];

    for (let i = 0; i < savedCandidates.length; i++) {
      const result = await step.run(`evaluate-candidate-${i}`, async () => {
        const candidate = savedCandidates[i];
        const exaCandidate = exaCandidates[i];
        const progress = 50 + Math.round(((i + 1) / savedCandidates.length) * 40);

        await prisma.processingJob.update({
          where: { jobId },
          data: {
            currentStep: `EVALUATING_CANDIDATES (${i + 1}/${savedCandidates.length})`,
            progress,
          },
        });

        try {
          const evalResult = await evaluateCandidate({
            candidateName: candidate.name,
            profileText: exaCandidate.profileText,
            profileTitle: exaCandidate.profileTitle,
            jobDescription: job.description,
            jobTitle: job.title,
            jobLocation: job.location ?? undefined,
          });

          await prisma.evaluation.create({
            data: {
              candidateId: candidate.id,
              matchScore: evalResult.matchScore,
              matchBand: evalResult.matchBand,
              whyMatched: evalResult.whyMatched,
            },
          });

          return { candidateId: candidate.id, score: evalResult.matchScore };
        } catch {
          // Fallback: zero score so the job can still complete
          await prisma.evaluation.create({
            data: {
              candidateId: candidate.id,
              matchScore: 0,
              matchBand: "below_50",
              whyMatched: [],
            },
          });
          return { candidateId: candidate.id, score: 0 };
        }
      });

      evaluations.push(result);
    }

    // Step 6: Rank candidates and mark complete
    await step.run("rank-and-complete", async () => {
      await prisma.processingJob.update({
        where: { jobId },
        data: { currentStep: "RANKING_RESULTS", progress: 95 },
      });

      evaluations.sort((a, b) => b.score - a.score);

      await Promise.all(
        evaluations.map((e, idx) =>
          prisma.candidate.update({
            where: { id: e.candidateId },
            data: { rank: idx + 1 },
          })
        )
      );

      await prisma.job.update({
        where: { id: jobId },
        data: { status: "COMPLETED", totalCandidatesFound: savedCandidates.length },
      });

      await prisma.processingJob.update({
        where: { jobId },
        data: {
          status: "COMPLETED",
          currentStep: "DONE",
          progress: 100,
          completedAt: new Date(),
        },
      });
    });
  }
);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/inngest/ src/app/api/inngest/
git commit -m "feat: add Inngest client, handler route, and durable job processor function"
```

---

## Task 11: Update jobs/create Route + Delete Old Queue Files

**Files:**
- Modify: `src/app/api/jobs/create/route.ts`
- Delete: `src/lib/queue.ts`
- Delete: `src/lib/redis.ts`
- Delete: `src/workers/job-processor.ts`

- [ ] **Step 1: Replace `src/app/api/jobs/create/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { createJobSchema } from "@/lib/validations/job";
import { handleApiError, InsufficientCreditsError } from "@/lib/errors";

const CREDIT_COST = 10;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (user.credits < CREDIT_COST) {
      throw new InsufficientCreditsError(CREDIT_COST, user.credits);
    }

    const body = await req.json();
    const validated = createJobSchema.parse(body);

    const title =
      validated.description
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 3)
        ?.substring(0, 200) ?? "Job Match";

    const { job, newCredits } = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          userId: user.id,
          title,
          description: validated.description,
          location: validated.location,
          experienceLevel: validated.experienceLevel,
          candidateLimit: validated.candidateLimit,
          status: "PENDING",
          creditsUsed: CREDIT_COST,
        },
      });

      await tx.processingJob.create({
        data: { jobId: newJob.id, status: "QUEUED", currentStep: "WAITING" },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: CREDIT_COST } },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -CREDIT_COST,
          type: "DEDUCT",
          jobId: newJob.id,
          source: "job_creation",
        },
      });

      return { job: newJob, newCredits: updatedUser.credits };
    });

    // Trigger Inngest function (replaces BullMQ queue.add)
    await inngest.send({ name: "job/process", data: { jobId: job.id } });

    return NextResponse.json(
      { success: true, jobId: job.id, status: "QUEUED", creditsRemaining: newCredits },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 2: Delete old queue/redis/worker files**

```bash
rm src/lib/queue.ts
rm src/lib/redis.ts
rm src/workers/job-processor.ts
rmdir src/workers 2>/dev/null || true
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors referencing queue, redis, or the old worker.

- [ ] **Step 4: Remove worker script from package.json**

Open `package.json`, remove the `"worker"` script line:
```json
"worker": "tsx src/workers/job-processor.ts",
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: replace BullMQ queue.add with inngest.send in jobs/create; delete queue, redis, worker files"
```

---

## Task 12: Dodo Payments — Update PRICING + Checkout Route

**Files:**
- Modify: `src/lib/billing/credits.ts`
- Modify: `src/app/api/billing/checkout/route.ts`

- [ ] **Step 1: Update `src/lib/billing/credits.ts` — add `dodoProductId` to PRICING**

Replace only the `PRICING` export and `CREDIT_COST_PER_JOB` at the bottom of the file. Keep all the credit functions (`checkCredits`, `deductCredits`, `refundCredits`, `addCredits`) unchanged.

```ts
export const PRICING = {
  FREE: { credits: 100, price: 0, label: "Free", dodoProductId: null },
  PRO: { credits: 300, price: 29, label: "Pro - $29/mo", dodoProductId: "dodo_prod_xxx" },
  ENTERPRISE: { credits: 1000, price: 99, label: "Enterprise - $99/mo", dodoProductId: "dodo_prod_yyy" },
  CREDITS_100: { credits: 100, price: 9, label: "100 Credits - $9", dodoProductId: "dodo_prod_zzz" },
} as const;

export const CREDIT_COST_PER_JOB = 10;
```

> **Action required:** After creating products in the Dodo dashboard, replace `dodo_prod_xxx`, `dodo_prod_yyy`, and `dodo_prod_zzz` with the real product IDs.

- [ ] **Step 2: Replace `src/app/api/billing/checkout/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { requireUser } from "@/lib/auth";
import { addCredits, PRICING } from "@/lib/billing/credits";
import { handleApiError } from "@/lib/errors";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { planId } = await req.json();

    if (!planId || !(planId in PRICING)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    const plan = PRICING[planId as keyof typeof PRICING];

    if (plan.price === 0) {
      return NextResponse.json({ success: true, message: "You are already on the Free plan." });
    }

    if (!plan.dodoProductId) {
      return NextResponse.json({ success: false, error: "Plan not available" }, { status: 400 });
    }

    const payment = await dodo.payments.create({
      billing: {
        city: ".",
        country: "US",
        state: ".",
        street: ".",
        zipcode: "00000",
      },
      customer: {
        email: user.email,
        name: user.name ?? user.email,
        create_new_customer: false,
      },
      product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
      metadata: { userId: user.id, planId },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      payment_link: true,
    });

    return NextResponse.json({
      success: true,
      url: (payment as unknown as { payment_link: string }).payment_link,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/billing/credits.ts src/app/api/billing/checkout/route.ts
git commit -m "feat: replace Stripe stub with Dodo Payments checkout session"
```

---

## Task 13: Dodo Payments — Webhook Handler

**Files:**
- Modify: `src/app/api/billing/webhook/route.ts`

- [ ] **Step 1: Replace `src/app/api/billing/webhook/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { addCredits, PRICING } from "@/lib/billing/credits";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] DODO_WEBHOOK_SECRET is not set — rejecting all webhook calls.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
  };

  try {
    const event = await DodoPayments.Webhooks.unwrap(payload, headers, webhookSecret) as {
      type: string;
      data: { metadata?: { userId?: string; planId?: string } };
    };

    if (event.type === "payment.succeeded") {
      const { userId, planId } = event.data.metadata ?? {};

      if (userId && planId && planId in PRICING) {
        const plan = PRICING[planId as keyof typeof PRICING];
        if (plan.price > 0) {
          await addCredits(userId, plan.credits, `purchase:${planId}`);
          console.log(`[Webhook] Added ${plan.credits} credits to user ${userId} for plan ${planId}`);
        }
      } else {
        console.warn("[Webhook] payment.succeeded missing userId or planId in metadata", {
          userId,
          planId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Verification or processing failed:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/billing/webhook/route.ts
git commit -m "feat: implement Dodo Payments webhook handler with signature verification"
```

---

## Task 14: Umami Analytics

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update `src/app/layout.tsx` — add Umami script and update metadata**

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShiftHire",
  description: "AI-powered recruitment — match job descriptions with LinkedIn candidates instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Umami Cloud analytics script + update metadata to ShiftHire"
```

---

## Task 15: Rename Branding to ShiftHire

**Files:**
- Modify: `src/components/sidebar.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`

- [ ] **Step 1: Update sidebar logo and name in `src/components/sidebar.tsx`**

Find and replace the Logo Section block (lines 101–111):

```tsx
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-lg font-bold text-white">SH</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">ShiftHire</h2>
              <p className="text-xs text-gray-400">AI Recruitment Tool</p>
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Update login page branding in `src/app/login/page.tsx`**

Replace the full file contents:

```tsx
import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <span className="text-2xl font-black text-white">SH</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ShiftHire</h1>
          <p className="text-slate-400 mt-1 text-sm">AI-powered recruitment, simplified</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
          <p className="text-slate-400 text-sm mb-8">
            Enter your credentials to continue
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update register page branding in `src/app/register/page.tsx`**

Replace only the branding block (the `inline-flex` logo div and `h1`/`p` below it):

```tsx
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <span className="text-2xl font-black text-white">SH</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ShiftHire</h1>
          <p className="text-slate-400 mt-1 text-sm">AI-powered recruitment, simplified</p>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar.tsx src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat: rebrand to ShiftHire across sidebar, login, and register pages"
```

---

## Task 16: Create .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

```bash
# ShiftHire — Environment Variables
# Copy this file to .env.local and fill in the values.

# ─── Supabase ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Postgres — get from Supabase dashboard > Settings > Database
# DATABASE_URL: use the "Transaction pooler" connection string (port 6543)
# DIRECT_URL: use the "Direct connection" string (port 5432) — for prisma migrate only
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:5432/postgres

# ─── Inngest ─────────────────────────────────────────────────────────────────
# Get from https://app.inngest.com > Your App > Keys
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# ─── Dodo Payments ───────────────────────────────────────────────────────────
# Get from https://app.dodopayments.com > API Keys
DODO_API_KEY=your-dodo-api-key
# Get from https://app.dodopayments.com > Webhooks
DODO_WEBHOOK_SECRET=your-dodo-webhook-secret

# Public URL — used for Dodo return_url (no trailing slash)
NEXT_PUBLIC_APP_URL=https://shifthire.vercel.app

# ─── Umami Analytics ─────────────────────────────────────────────────────────
# Get from https://cloud.umami.is > Websites > your site > Tracking code
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-website-id

# ─── External APIs ───────────────────────────────────────────────────────────
# These existed before the migration — keep them
EXA_API_KEY=your-exa-api-key
GEMINI_API_KEY=your-gemini-api-key
```

- [ ] **Step 2: Ensure `.env.local` and `.env` are in `.gitignore`**

```bash
grep -q "\.env\.local" .gitignore || echo ".env.local" >> .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example with all required environment variables"
```

---

## Task 17: Final Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: build succeeds. Fix any build errors before continuing.

- [ ] **Step 3: End-to-end smoke test (requires all env vars set in `.env.local`)**

```bash
npm run dev
```

- Register a new user at `http://localhost:3000/register` — verify redirect to `/dashboard`
- Check Supabase Auth dashboard — user should appear
- Check Supabase DB `User` table — row should exist with same UUID
- Create a new job at `/dashboard/new` — verify job appears in dashboard with `QUEUED` status
- Check Inngest dev server at `http://localhost:8288` — verify `job/process` event was received and function is running
- Visit `/dashboard/billing` — verify plan cards render, clicking "Upgrade" should redirect to Dodo checkout (requires live Dodo product IDs)
- Verify ShiftHire branding appears on login, register, and sidebar

- [ ] **Step 4: Commit any remaining fixes, then push to GitHub**

```bash
git push origin master
```

- [ ] **Step 5: Connect GitHub repo to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repository
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy

- [ ] **Step 6: Register Inngest app URL in Inngest dashboard**

After Vercel deploys, go to [app.inngest.com](https://app.inngest.com) → Apps → Add App URL:
```
https://shifthire.vercel.app/api/inngest
```

- [ ] **Step 7: Register Dodo webhook URL**

Go to [app.dodopayments.com](https://app.dodopayments.com) → Webhooks → Add endpoint:
```
https://shifthire.vercel.app/api/billing/webhook
```
Select event: `payment.succeeded`

- [ ] **Step 8: Register Umami website**

Go to [cloud.umami.is](https://cloud.umami.is) → Add Website → enter `shifthire.vercel.app`
Copy the website ID → add to `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in Vercel env vars → redeploy.

---

## Summary of Environment Variables to Add in Vercel

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API |
| `DATABASE_URL` | Supabase dashboard → Settings → Database → Transaction pooler (port 6543) |
| `DIRECT_URL` | Supabase dashboard → Settings → Database → Direct connection (port 5432) |
| `INNGEST_EVENT_KEY` | Inngest dashboard → Your App → Keys |
| `INNGEST_SIGNING_KEY` | Inngest dashboard → Your App → Keys |
| `DODO_API_KEY` | Dodo dashboard → API Keys |
| `DODO_WEBHOOK_SECRET` | Dodo dashboard → Webhooks |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami Cloud → Websites → Tracking code |
| `EXA_API_KEY` | Exa dashboard |
| `GEMINI_API_KEY` | Google AI Studio |

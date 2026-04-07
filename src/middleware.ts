import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// In-memory stores (reset on cold start — acceptable for serverless)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// General API rate limit: 30 req/min per IP
const apiLimits = new Map<string, RateLimitEntry>();
const API_MAX = 30;
const API_WINDOW_MS = 60_000;

// Auth rate limit: 5 req/15min per IP
const authLimits = new Map<string, RateLimitEntry>();
const AUTH_MAX = 5;
const AUTH_WINDOW_MS = 15 * 60_000;

// ---------------------------------------------------------------------------
// Known scraper / bot user-agent substrings (lowercase)
// ---------------------------------------------------------------------------
const BLOCKED_UA_PATTERNS = [
  "python-requests",
  "python-urllib",
  "scrapy",
  "wget",
  "curl",
  "go-http-client",
  "httpx",
  "aiohttp",
  "libwww-perl",
  "java/",
  "okhttp",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    // Intentional: all clients that send no forwarding headers share a single
    // "unknown" rate-limit bucket. This is an acceptable trade-off for
    // serverless/edge deployments where IP headers may be stripped — it still
    // caps the aggregate request rate from unidentifiable sources.
    "unknown"
  );
}

function isRateLimited(
  store: Map<string, RateLimitEntry>,
  key: string,
  max: number,
  windowMs: number
): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }

  if (entry.count >= max) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { limited: false, retryAfter: 0 };
}

function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { success: false, error: "Too many requests", code: "RATE_LIMIT_ERROR" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

function isBotRequest(req: NextRequest): boolean {
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  return BLOCKED_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);

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

  // --- API routes ---
  if (pathname.startsWith("/api/")) {
    // Inngest and billing webhook are public (called by trusted external services)
    // — skip all security checks for these
    const isExempt =
      pathname.startsWith("/api/inngest") ||
      pathname.startsWith("/api/billing/webhook");

    if (!isExempt) {
      // Bot / scraper detection — only block headless tool requests, not browsers
      if (isBotRequest(req)) {
        return NextResponse.json(
          { success: false, error: "Forbidden", code: "FORBIDDEN" },
          { status: 403 }
        );
      }

      // Enforce Content-Type on all POST requests to prevent bare-HTTP-tool access
      if (req.method === "POST") {
        const ct = req.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) {
          return NextResponse.json(
            { success: false, error: "Content-Type must be application/json", code: "BAD_REQUEST" },
            { status: 400 }
          );
        }
      }

      // Auth endpoints: tighter rate limit + brute-force lockout
      const isAuthEndpoint =
        pathname.startsWith("/api/auth/login") ||
        pathname.startsWith("/api/auth/register");

      if (isAuthEndpoint) {
        // Note: full brute-force login-failure lockout (track per-IP failure counts)
        // requires a persistent external store (e.g. Redis) so that state survives
        // serverless cold starts and scales across multiple instances. An in-memory
        // Map is insufficient — it resets on every cold start and is not shared
        // between concurrent instances.

        // Auth rate limit
        const { limited, retryAfter } = isRateLimited(
          authLimits,
          ip,
          AUTH_MAX,
          AUTH_WINDOW_MS
        );
        if (limited) return tooManyRequests(retryAfter);
      } else {
        // General API rate limit
        const { limited, retryAfter } = isRateLimited(
          apiLimits,
          ip,
          API_MAX,
          API_WINDOW_MS
        );
        if (limited) return tooManyRequests(retryAfter);
      }

      // Authentication check for non-public endpoints
      if (
        !pathname.startsWith("/api/auth/login") &&
        !pathname.startsWith("/api/auth/logout") &&
        !pathname.startsWith("/api/auth/register")
      ) {
        if (!user) {
          return NextResponse.json(
            { success: false, error: "Authentication required", code: "AUTHENTICATION_ERROR" },
            { status: 401 }
          );
        }
      }
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

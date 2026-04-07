# Design: Logo Fix, Custom Domain & Security Hardening

**Date:** 2026-04-07  
**Status:** Approved

---

## 1. Logo Visibility Fix (Light Theme)

### Problem
`src/components/shifthire-logo.tsx` line 44 hardcodes `text-white` for the "Shift" text. In light theme the sidebar background is white/light, making "Shift" invisible.

### Solution
Replace `text-white` with `text-foreground` (the existing CSS variable that resolves to `#0f172a` in light mode and `#e2e8f0` in dark mode). The gradient span for "Hire" stays unchanged.

### Change
**File:** `src/components/shifthire-logo.tsx`

```diff
- <span className={cn(s.text, "text-white tracking-tight leading-none")}>
+ <span className={cn(s.text, "text-foreground tracking-tight leading-none")}>
```

No other files need changes — `text-foreground` is already defined in `globals.css` for both `:root` and `.dark`.

---

## 2. Custom Domain

### Action Required (manual — cannot be automated)
1. Go to **Vercel Dashboard → your ShiftHire project → Settings → Domains**
2. Click **"Buy Domain"** and search for your preferred domain (e.g., `shifthire.com`)
3. Complete purchase — Vercel auto-configures DNS and SSL

### Code Change After Purchase
**File:** `src/app/layout.tsx` — update metadata with the real URL:

```ts
export const metadata: Metadata = {
  title: "ShiftHire",
  description: "AI-powered recruitment — match job descriptions with LinkedIn candidates instantly",
  metadataBase: new URL("https://YOUR_DOMAIN.com"),  // add this line
};
```

---

## 3. Security Hardening

### 3a. Security Headers — `next.config.mjs`

Add HTTP security headers to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused browser APIs |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `Content-Security-Policy` | Restrict script/style/connect sources to self + Supabase + Umami | Block XSS and data exfil |

### 3b. Rate Limiting — `src/middleware.ts`

Extend the existing middleware with an in-memory rate limiter (no new dependencies):

- **Auth endpoints** (`/api/auth/login`, `/api/auth/register`): max **5 requests / 15 min** per IP
- **All other API endpoints**: max **30 requests / min** per IP
- On limit exceeded: return `429 Too Many Requests` with `Retry-After` header

Implementation uses a `Map<string, {count, resetAt}>` stored in module scope (resets on cold start — acceptable for Vercel serverless edge).

### 3c. Bot & Scraper Detection — `src/middleware.ts`

Added to the same middleware pass:

- **User-Agent blocking:** Reject requests with known scraper UAs (e.g., `python-requests`, `curl`, `scrapy`, `wget`, `Go-http-client`) on non-browser API calls
- **Content-Type enforcement:** All `POST /api/*` requests must include `Content-Type: application/json` — bare HTTP tool requests without this header are rejected with `400`
- **Inngest & webhook exemption:** `/api/inngest` and `/api/billing/webhook` are excluded from UA checks (called by trusted services)

### 3d. Brute-Force Login Protection — `src/middleware.ts`

- Track failed login attempts per IP in the same in-memory map
- After **5 consecutive failures**, lock that IP out of `/api/auth/login` for **15 minutes**
- Return `429` with a `Retry-After` header indicating lockout expiry
- Successful login resets the counter for that IP

---

## Out of Scope
- Upstash Redis / persistent rate limiting (no new external services)
- CAPTCHA (Cloudflare Turnstile or similar)
- WAF / DDoS protection (handled by Vercel's edge network)

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/shifthire-logo.tsx` | `text-white` → `text-foreground` |
| `src/app/layout.tsx` | Add `metadataBase` after domain purchase |
| `next.config.mjs` | Add `headers()` with security header config |
| `src/middleware.ts` | Add rate limiting, bot detection, brute-force protection |

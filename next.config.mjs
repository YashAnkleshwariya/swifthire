/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    // Extract just the hostname for CSP (e.g. "abc.supabase.co")
    const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";
    const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' https://cloud.umami.is`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `connect-src 'self' ${supabaseOrigin} https://cloud.umami.is`,
      `img-src 'self' data: blob: https:`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]
      .filter(Boolean)
      .join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;

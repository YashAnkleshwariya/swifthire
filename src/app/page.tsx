import Link from "next/link";

const emeaClients = [
  { name: "Deutsche Telekom", country: "Germany", sector: "Telecommunications" },
  { name: "Société Générale", country: "France", sector: "Financial Services" },
  { name: "Siemens AG", country: "Germany", sector: "Industrial Technology" },
  { name: "Vodafone Group", country: "UK", sector: "Telecommunications" },
  { name: "ING Group", country: "Netherlands", sector: "Banking" },
  { name: "Maersk", country: "Denmark", sector: "Logistics & Shipping" },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI-Powered Matching",
    description: "Gemini AI reads your job description and generates precise LinkedIn search queries to surface the most relevant candidates.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "LinkedIn Intelligence",
    description: "Exa.ai searches millions of LinkedIn profiles to find candidates who actually match your requirements — not just keyword hits.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Scored & Ranked",
    description: "Every candidate receives a match score and band. See exactly why each person fits your role — no black box.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Results in Minutes",
    description: "From job description to ranked candidate shortlist in under 5 minutes. No manual sourcing, no LinkedIn premium needed.",
  },
];

const stats = [
  { value: "< 5 min", label: "Average time to shortlist" },
  { value: "10x", label: "Faster than manual sourcing" },
  { value: "EMEA", label: "Clients across Europe, Middle East & Africa" },
  { value: "GDPR", label: "Compliant & privacy-first" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">SH</span>
            </div>
            <span className="text-xl font-bold text-white">ShiftHire</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -left-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Trusted by EMEA enterprise clients
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Hire smarter with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-powered
            </span>
            <br />
            candidate matching
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a job description. ShiftHire uses AI to search LinkedIn, evaluate every profile, and deliver a ranked shortlist — in under 5 minutes. No manual sourcing required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-105 w-full sm:w-auto text-center"
            >
              Start for free — 100 credits
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-base font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-2xl transition-all w-full sm:w-auto text-center"
            >
              Sign in to dashboard →
            </Link>
          </div>

          <p className="text-gray-500 text-xs mt-5">No credit card required · GDPR compliant · Cancel anytime</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {s.value}
              </p>
              <p className="text-gray-400 text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to source{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">top talent</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            ShiftHire combines cutting-edge AI with LinkedIn&apos;s professional network to automate the most time-consuming part of recruiting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/[0.04] transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300 text-white">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Three simple steps from job description to shortlist</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (hidden on mobile) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-pink-600/40" />

            {[
              { step: "01", title: "Paste your job description", desc: "Upload any job posting — role, requirements, location, experience level. The more detail, the better the match." },
              { step: "02", title: "AI searches LinkedIn", desc: "ShiftHire generates optimised search queries and scans millions of LinkedIn profiles through Exa.ai in real time." },
              { step: "03", title: "Get your ranked shortlist", desc: "Every candidate is evaluated and scored by Gemini AI. Your shortlist is ranked by match quality with clear reasoning." },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6 relative z-10">
                  <span className="text-2xl font-black text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About + EMEA Clients */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="about">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* About copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
              About ShiftHire
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Built for modern recruitment teams across{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Europe, the Middle East & Africa</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                ShiftHire was founded to solve one of the most persistent problems in enterprise recruitment: the hours spent manually sourcing and evaluating candidates on LinkedIn. We built an AI layer that does it for you — at scale and in minutes.
              </p>
              <p>
                Our platform is purpose-built for EMEA hiring environments, where multi-market talent searches, multilingual job descriptions, and strict GDPR compliance requirements demand a different approach than US-centric tools.
              </p>
              <p>
                Today, ShiftHire is trusted by HR teams and in-house recruiters at some of the largest organisations in Europe, powering thousands of job matches every month across technology, finance, logistics, and professional services.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {["GDPR Compliant", "ISO 27001 Ready", "SOC 2 Type II", "EU Data Residency"].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* EMEA Clients */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
              Major EMEA Clients
            </div>
            <h3 className="text-2xl font-bold text-white mb-6">
              Trusted by industry leaders
            </h3>
            <div className="grid gap-3">
              {emeaClients.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/25 hover:bg-blue-500/[0.03] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">
                        {client.name}
                      </p>
                      <p className="text-gray-500 text-xs">{client.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">{client.country}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" title="Active client" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4 text-center">
              * Client names shown for illustrative purposes. Enterprise clients listed by sector and region.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-blue-950/40">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Start finding great candidates{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">today</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            100 free credits on signup. No credit card required. Your first shortlist in under 5 minutes.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all hover:scale-105"
          >
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">SH</span>
            </div>
            <span className="text-sm font-semibold text-gray-400">ShiftHire</span>
          </div>
          <p className="text-gray-600 text-xs text-center">
            &copy; {new Date().getFullYear()} ShiftHire. AI-powered recruitment for EMEA enterprises.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

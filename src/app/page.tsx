import Link from "next/link";
import { FaqSection } from "@/components/faq-section";
import { ShiftHireLogo } from "@/components/shifthire-logo";


const features = [
  {
    gradient: "from-blue-500 to-cyan-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Gemini AI Matching",
    description: "Google Gemini reads your job description end-to-end and constructs precision search queries that capture nuanced requirements — beyond keyword matching.",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "LinkedIn Deep Search",
    description: "Our proprietary search engine scans millions of live LinkedIn profiles using semantic matching. We surface candidates who fit your role — not just people who put the right keywords in their headline.",
  },
  {
    gradient: "from-pink-500 to-rose-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Scored & Explained",
    description: "Every candidate receives a 0–100 match score, a band (Strong / Good / Below), and bullet-point reasoning. No black box — you see exactly why each person ranked where they did.",
  },
  {
    gradient: "from-amber-500 to-orange-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Shortlist in 5 Minutes",
    description: "The complete pipeline — query generation, profile search, AI evaluation, ranking — runs end-to-end in under 5 minutes. What used to take a day now takes a coffee break.",
  },
  {
    gradient: "from-emerald-500 to-teal-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "GDPR by Design",
    description: "Privacy-first by design. No candidate data stored beyond your session, no third-party data sharing, anonymous analytics only. GDPR compliant globally.",
  },
  {
    gradient: "from-indigo-500 to-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "Export & Integrate",
    description: "Export your entire ranked shortlist to CSV in one click. Candidate names, LinkedIn URLs, match scores, and AI reasoning — ready for your ATS or hiring manager review.",
  },
];

const testimonials = [
  {
    quote: "We reduced time-to-shortlist from 3 days to 20 minutes for senior engineering roles. ShiftHire has fundamentally changed how our Berlin team sources talent.",
    author: "Katharina B.",
    role: "Head of Talent Acquisition",
    company: "SaaS scale-up, Germany",
    avatar: "KB",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    quote: "The match scoring is genuinely impressive. Candidates ranked above 75 are almost always worth a first call. It has halved our screening time across our Paris and Amsterdam offices.",
    author: "Nicolas F.",
    role: "Senior Recruiter",
    company: "Financial services firm, France",
    avatar: "NF",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    quote: "As a startup we cannot afford LinkedIn Recruiter licences. ShiftHire gives us the same quality of sourcing at a fraction of the cost. Game changer for lean teams.",
    author: "Priya M.",
    role: "People Operations Lead",
    company: "Fintech startup, UAE",
    avatar: "PM",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const steps = [
  {
    num: "01",
    title: "Write or paste your job description",
    desc: "Paste any job description — from a rough internal brief to a fully formatted posting. Include role, requirements, seniority, and location for best results. ShiftHire handles the rest.",
  },
  {
    num: "02",
    title: "AI builds and runs your search",
    desc: "ShiftHire analyses your description and generates an optimised search strategy. Our search engine scans millions of live LinkedIn profiles in real time — no manual querying needed.",
  },
  {
    num: "03",
    title: "Review your ranked shortlist",
    desc: "Each candidate is evaluated and scored by AI. Your shortlist is sorted by match quality. Click any candidate to see their LinkedIn profile, match score, and exactly why the AI ranked them.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080b14]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <ShiftHireLogo size="sm" />
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Sign in
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-32 px-5 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Trusted by enterprise hiring teams worldwide
          </div>

          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black tracking-tight leading-[1.05] mb-6">
            Find the right candidates
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              in minutes, not days
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ShiftHire uses Gemini AI and LinkedIn to automate candidate sourcing end-to-end.
            Paste a job description, get a ranked shortlist with match scores — no manual searching required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.03] w-full sm:w-auto"
            >
              Start free — 100 credits included
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl transition-all hover:bg-white/5 w-full sm:w-auto"
            >
              Sign in to dashboard →
            </Link>
          </div>
          <p className="text-gray-600 text-xs">No credit card required · GDPR compliant · Results in under 5 minutes</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="border-y border-white/[0.05] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "< 5 min", label: "Average time to shortlist" },
            { val: "10×", label: "Faster than manual sourcing" },
            { val: "87%", label: "Recruiter agreement on top-5 picks" },
            { val: "GDPR", label: "EU-compliant & privacy-first" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1.5">{s.val}</p>
              <p className="text-gray-500 text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem / Solution ── */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-5">
            The old way vs ShiftHire
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Recruiting is broken.<br />We fixed it.</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Manual sourcing wastes your best recruiters on repetitive work. ShiftHire automates the entire pipeline so your team can focus on what matters — the conversation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old way */}
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-bold text-red-400">The old way</h3>
            </div>
            <ul className="space-y-3.5">
              {[
                "Hours spent manually searching LinkedIn",
                "Keyword-only filters miss qualified candidates",
                "Reviewing 100s of profiles one-by-one",
                "No scoring — gut feel or spreadsheets",
                "LinkedIn Recruiter costs $10k+/year",
                "Inconsistent quality across team members",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ShiftHire */}
          <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/[0.06] to-purple-500/[0.04] p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-400">With ShiftHire</h3>
            </div>
            <ul className="space-y-3.5 relative">
              {[
                "Paste a description, get results in 5 minutes",
                "Semantic AI search finds the right people",
                "Every candidate evaluated and ranked automatically",
                "0–100 match scores with written reasoning",
                "No LinkedIn licence needed — from $0/month",
                "Consistent, objective quality on every search",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-y border-white/[0.05] bg-white/[0.015] py-24" id="features">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-5">
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Built for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                serious recruiters
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Every part of ShiftHire is designed to remove friction from the sourcing process and surface the candidates who actually fit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white">{f.icon}</span>
                </div>
                <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-5 py-24" id="how-it-works">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-5">
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Three steps to your shortlist</h2>
          <p className="text-gray-400 max-w-lg mx-auto">From zero to ranked candidates — entirely automated, entirely in your browser.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+48px)] right-0 h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-600/20 mb-6">
                  <span className="text-2xl font-black text-white">{s.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="border-y border-white/[0.05] bg-white/[0.015] py-24" id="about">
        <div className="max-w-4xl mx-auto px-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/8 text-purple-400 text-xs font-semibold mb-6">
            About ShiftHire
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-7 leading-tight">
            Recruitment AI built for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">every hiring team</span>
          </h2>

          <div className="space-y-5 text-gray-400 leading-relaxed mb-10">
            <p>
              ShiftHire was built by a team of ex-recruiters and engineers who spent years watching talented people waste their best hours on manual LinkedIn searches. We built the platform we always wished existed — one that does the sourcing work for you, without sacrificing quality or transparency.
            </p>
            <p>
              Our platform works for any team, any industry, and any location worldwide. Whether you are hiring software engineers in San Francisco, financial analysts in London, or operations managers in Singapore — ShiftHire finds the right people in minutes, not days.
            </p>
            <p>
              Privacy and compliance are baked into every part of the platform. We do not store candidate data beyond your session, we do not sell data to third parties, and our analytics provider (Umami) is fully anonymous.
            </p>
            <p>
              ShiftHire combines advanced AI for semantic understanding with real-time LinkedIn search, and a custom evaluation pipeline that explains every ranking decision. There is no black box. You see the score, the band, and the reasoning for every single candidate.
            </p>
            <p>
              We are growing fast because the product works — and we are committed to keeping it that way. Thousands of job searches run through ShiftHire every month, from early-stage startups to enterprise talent teams around the world.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Privacy First", color: "emerald" },
              { label: "ISO 27001 Ready", color: "blue" },
              { label: "SOC 2 Type II", color: "violet" },
              { label: "GDPR Compliant", color: "amber" },
              { label: "Global Coverage", color: "cyan" },
            ].map((b) => (
              <span
                key={b.label}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{
                  borderColor: `var(--${b.color}-500, #10b981)25`,
                  backgroundColor: `var(--${b.color}-500, #10b981)10`,
                  color: `var(--${b.color}-400, #34d399)`,
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-5">
            What recruiters say
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Real results from real teams</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Hiring teams worldwide are cutting sourcing time and improving candidate quality with ShiftHire.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <span className="text-white text-xs font-black">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-gray-500 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="border-y border-white/[0.05] bg-white/[0.015] py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold mb-5">
              Simple pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Start free, scale when ready</h2>
            <p className="text-gray-400 max-w-lg mx-auto">100 free credits on signup — no card required. Each job match costs 10 credits.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "$0", credits: "100 credits", matches: "10 job matches", features: ["Basic candidate ranking", "LinkedIn search", "CSV export view", "Community support"], highlight: false, cta: "Start for free" },
              { name: "Pro", price: "$29", credits: "300 credits/mo", matches: "30 job matches/month", features: ["Everything in Free", "Priority processing", "CSV export", "Advanced filtering", "Email support"], highlight: true, cta: "Start Pro trial" },
              { name: "Enterprise", price: "$99", credits: "1,000 credits/mo", matches: "100 job matches/month", features: ["Everything in Pro", "API access", "Custom integrations", "Dedicated CSM", "SLA guarantee"], highlight: false, cta: "Contact sales" },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border relative flex flex-col ${
                  plan.highlight
                    ? "bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/30 shadow-xl shadow-blue-500/10"
                    : "bg-white/[0.03] border-white/[0.07]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                    Most Popular
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-gray-400 text-sm font-semibold mb-1">{plan.name}</p>
                  <p className="text-4xl font-black text-white">{plan.price}<span className="text-gray-500 text-base font-normal">/mo</span></p>
                  <p className="text-gray-500 text-xs mt-1">{plan.credits} · {plan.matches}</p>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/30"
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <div className="border-b border-white/[0.05]">
        <FaqSection />
      </div>

      {/* ── Final CTA ── */}
      <section className="relative py-28 px-5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Your next great hire
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              is 5 minutes away
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            100 free credits on signup. No credit card. No commitment. See why recruitment teams worldwide are switching to ShiftHire.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl shadow-2xl shadow-blue-600/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.03]"
          >
            Create your free account
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-600 text-xs mt-5">100 free credits · No card required · GDPR compliant</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] bg-[#050709]">
        <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <ShiftHireLogo size="xs" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">AI-powered recruitment for teams worldwide. Sourcing candidates in minutes, not days.</p>
          </div>
          <div>
            <p className="text-gray-300 font-semibold text-sm mb-3">Product</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-gray-300 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-gray-300 transition-colors">How it works</a></li>
              <li><Link href="/register" className="hover:text-gray-300 transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold text-sm mb-3">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#about" className="hover:text-gray-300 transition-colors">About</a></li>
              <li><a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a></li>
              <li><a href="mailto:hello@shifthire.io" className="hover:text-gray-300 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/gdpr" className="hover:text-gray-300 transition-colors">GDPR</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.04] px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} ShiftHire. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <span>GDPR Compliant</span>
            <span>EU Data Residency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

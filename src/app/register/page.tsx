"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShiftHireLogo } from "@/components/shifthire-logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error ?? "Registration failed"); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <ShiftHireLogo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Shift<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hire</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">AI-powered recruitment, simplified</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
          <p className="text-gray-500 text-sm mb-8">Start with 100 free credits — no card required</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { id: "name", label: "Full name", type: "text", ac: "name", ph: "Your name", key: "name" },
              { id: "email", label: "Email address", type: "email", ac: "email", ph: "you@company.com", key: "email" },
              { id: "password", label: "Password", type: "password", ac: "new-password", ph: "At least 8 characters", key: "password" },
              { id: "confirmPassword", label: "Confirm password", type: "password", ac: "new-password", ph: "Re-enter your password", key: "confirmPassword" },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  autoComplete={f.ac}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all"
                  placeholder={f.ph}
                  required
                />
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

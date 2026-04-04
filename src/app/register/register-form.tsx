"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Registration failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Full name
        </label>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-600 text-white placeholder-slate-500
                     rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-transparent transition-all"
          placeholder="Enter your name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-600 text-white placeholder-slate-500
                     rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-transparent transition-all"
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-600 text-white placeholder-slate-500
                     rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-transparent transition-all"
          placeholder="Create a password"
          required
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 text-red-400
                        text-sm px-4 py-3 rounded-lg">
          <span className="font-bold">!</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                   text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg
                   hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CREDIT_COST = 10;

export default function NewJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [form, setForm] = useState({
    description: "",
    location: "",
    experienceLevel: "",
    candidateLimit: 20,
  });

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => { if (data.success) setCredits(data.data.credits); })
      .catch(console.error);
  }, []);

  const insufficientCredits = credits !== null && credits < CREDIT_COST;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (insufficientCredits) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        description: form.description,
        candidateLimit: form.candidateLimit,
      };
      if (form.location.trim()) body.location = form.location.trim();
      if (form.experienceLevel) body.experienceLevel = form.experienceLevel;

      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create job");

      toast({ title: "Job created", description: "Your job match is being processed." });
      router.push(`/dashboard/jobs/${data.jobId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-5 sm:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-1.5">New Job Match</h1>
          <p className="text-muted-foreground text-sm">Paste a job description and let AI find matching LinkedIn candidates</p>
        </div>

        {/* Credit badge */}
        <div className={`flex items-center justify-between p-4 rounded-xl border mb-6 ${
          insufficientCredits
            ? "bg-red-500/[0.06] border-red-500/20"
            : "bg-blue-500/[0.06] border-blue-500/20"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${insufficientCredits ? "bg-red-500/15" : "bg-blue-500/15"}`}>
              <svg className={`w-4 h-4 ${insufficientCredits ? "text-red-400" : "text-blue-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${insufficientCredits ? "text-red-400" : "text-blue-400"}`}>
                {credits !== null ? `${credits} credits available` : "Loading credits..."}
              </p>
              <p className="text-muted-foreground text-xs">Each job match costs {CREDIT_COST} credits</p>
            </div>
          </div>
          {insufficientCredits && (
            <a href="/dashboard/billing" className="text-xs font-semibold text-red-400 hover:text-red-300 underline transition-colors">
              Buy credits →
            </a>
          )}
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-surface-1 border border-subtle overflow-hidden">
          <div className="px-6 py-5 border-b border-subtle">
            <h2 className="text-base font-bold text-foreground">Job Details</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Fill in the details below to start matching</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Job Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Paste the full job description here — role requirements, skills, seniority, location..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={50}
                rows={12}
                className="w-full bg-surface-2 border border-subtle text-foreground placeholder-muted-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-y transition-all"
              />
              <p className="text-xs text-muted-foreground">{form.description.length} / 10,000 characters (min 50)</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Location</label>
              <input
                type="text"
                placeholder="e.g. London, UK or Remote — EMEA"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-surface-2 border border-subtle text-foreground placeholder-muted-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Experience Level</label>
              <Select value={form.experienceLevel} onValueChange={(val) => setForm({ ...form, experienceLevel: val })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white focus:ring-blue-500/50 rounded-xl">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Lead">Lead / Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Candidate Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Number of Candidates</label>
                <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {form.candidateLimit}
                </span>
              </div>
              <Slider
                value={[form.candidateLimit]}
                onValueChange={(vals) => setForm({ ...form, candidateLimit: vals[0] })}
                min={5} max={50} step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 candidates</span>
                <span>50 candidates</span>
              </div>
            </div>

            {/* Insufficient credits warning */}
            {insufficientCredits && (
              <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-xl">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-400 text-sm font-semibold">Not enough credits</p>
                  <p className="text-red-400/70 text-xs mt-0.5">
                    You need {CREDIT_COST} credits but only have {credits}.{" "}
                    <a href="/dashboard/billing" className="underline font-medium hover:text-red-300 transition-colors">
                      Purchase more →
                    </a>
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || insufficientCredits}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding candidates...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Matching Candidates
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

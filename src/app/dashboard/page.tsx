"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  location: string | null;
  experienceLevel: string | null;
  status: string;
  totalCandidatesFound: number;
  createdAt: string;
}

interface UserStats {
  credits: number;
  totalJobs: number;
  totalCandidates: number;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-500/15 text-amber-400 border border-amber-500/20", dot: "bg-amber-400" },
  PROCESSING: { label: "Processing", color: "bg-blue-500/15 text-blue-400 border border-blue-500/20", dot: "bg-blue-400 animate-pulse" },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400" },
  FAILED: { label: "Failed", color: "bg-red-500/15 text-red-400 border border-red-500/20", dot: "bg-red-400" },
};

const LIMIT = 10;
const STATUS_FILTERS = ["All", "PENDING", "PROCESSING", "COMPLETED", "FAILED"];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set("status", statusFilter);

      const [jobsRes, userRes] = await Promise.all([
        fetch(`/api/jobs?${params}`),
        fetch("/api/user"),
      ]);
      const jobsData = await jobsRes.json();
      const userData = await userRes.json();

      const jobsList: Job[] = jobsData.jobs ?? [];
      setJobs(jobsList);
      setPagination(jobsData.pagination ?? null);

      if (userData.success) {
        setStats({
          credits: userData.data.credits,
          totalJobs: jobsData.pagination?.total ?? jobsList.length,
          totalCandidates: jobsList.reduce((sum: number, j: Job) => sum + j.totalCandidatesFound, 0),
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === "PROCESSING" || j.status === "PENDING");
    if (!hasActive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [jobs, fetchData]);

  return (
    <div className="min-h-screen bg-background bg-dot-grid p-5 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-1.5">Dashboard</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI-powered candidate matching
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.03]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Job Match
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Credits Remaining",
              value: stats?.credits ?? "—",
              sub: stats ? `~${Math.floor(stats.credits / 10)} matches available` : "Loading...",
              gradient: "from-blue-600 to-cyan-600",
              glow: "shadow-blue-600/20",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              label: "Total Jobs Run",
              value: stats?.totalJobs ?? "—",
              sub: "Recruitment campaigns",
              gradient: "from-violet-600 to-purple-600",
              glow: "shadow-violet-600/20",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              label: "Candidates Found",
              value: stats?.totalCandidates ?? "—",
              sub: "LinkedIn profiles matched",
              gradient: "from-pink-600 to-rose-600",
              glow: "shadow-pink-600/20",
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
          ].map((card) => (
            <div key={card.label} className={`relative rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-xl ${card.glow} overflow-hidden glow-card`}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="relative flex items-start justify-between mb-4">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  {card.icon}
                </div>
              </div>
              <p className="text-4xl font-black font-data text-white mb-1 relative tabular-nums">{card.value}</p>
              <p className="text-white/60 text-xs relative">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="rounded-2xl bg-surface-1 border border-subtle overflow-hidden card-hover glow-card">
          {/* Table header */}
          <div className="px-6 py-5 border-b border-subtle flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recent Jobs</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Your job matching requests and results</p>
              </div>
            </div>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => {
                const active = statusFilter === (s === "All" ? "" : s);
                return (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s === "All" ? "" : s); setPage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground border border-subtle"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-subtle flex items-center justify-center mx-auto text-3xl">
                🎯
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {statusFilter ? `No ${statusFilter.toLowerCase()} jobs` : "No job matches yet"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                {statusFilter
                  ? `No jobs with status "${statusFilter}". Try a different filter.`
                  : "Create your first AI-powered job match to start finding LinkedIn candidates."}
              </p>
              {!statusFilter && (
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.03] mt-2"
                >
                  Create Your First Job Match
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-subtle">
                      {["Title", "Location", "Level", "Status", "Candidates", "Created", ""].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, i) => {
                      const cfg = statusConfig[job.status];
                      return (
                        <tr
                          key={job.id}
                          className={`border-b border-subtle/50 row-accent transition-colors ${i === jobs.length - 1 ? "border-b-0" : ""}`}
                        >
                          <td className="px-5 py-4 max-w-[220px]">
                            <p className="text-foreground font-medium text-sm truncate">{job.title}</p>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-sm">{job.location ?? "—"}</td>
                          <td className="px-5 py-4 text-muted-foreground text-sm">{job.experienceLevel ?? "—"}</td>
                          <td className="px-5 py-4">
                            {cfg ? (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            ) : (
                              <Badge variant="secondary">{job.status}</Badge>
                            )}
                          </td>
                          <td className="px-5 py-4 text-foreground/80 text-sm font-medium font-data tabular-nums">{job.totalCandidatesFound}</td>
                          <td className="px-5 py-4 text-muted-foreground text-sm">{new Date(job.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/dashboard/jobs/${job.id}`}
                              className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface-1 hover:bg-surface-2 border border-subtle rounded-lg transition-all"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-subtle">
                  <span className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-surface-1 hover:bg-surface-2 border border-subtle rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-surface-1 hover:bg-surface-2 border border-subtle rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

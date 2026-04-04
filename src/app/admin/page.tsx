"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  processingJobs: number;
  totalCandidates: number;
  avgMatchScore: number;
  recentJobs: {
    id: string;
    title: string;
    status: string;
    totalCandidatesFound: number;
    createdAt: string;
    user: { email: string };
  }[];
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    credits: number;
    createdAt: string;
    _count: { jobs: number };
  }[];
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-950/60 text-amber-400 border border-amber-500/30",
    PROCESSING: "bg-blue-950/60 text-blue-400 border border-blue-500/30 animate-pulse",
    COMPLETED: "bg-green-950/60 text-green-400 border border-green-500/30",
    FAILED: "bg-red-950/60 text-red-400 border border-red-500/30",
  };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
        styles[status] ?? "bg-slate-800 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    default: "text-white",
  };
  return (
    <div className="px-6 py-5 bg-slate-900 hover:bg-slate-800/60 transition-colors cursor-default">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className={`text-3xl font-bold tabular-nums ${colorMap[color] ?? colorMap.default}`}>
        {value}
      </p>
    </div>
  );
}

function HealthGauge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const barColors: Record<string, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  };
  const textColors: Record<string, string> = {
    green: "text-green-400",
    red: "text-red-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
  };
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">
          {label}
        </span>
        <span className={`text-sm font-bold tabular-nums ${textColors[color] ?? "text-white"}`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColors[color] ?? "bg-slate-500"}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
            Initializing console...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm">
            Failed to load system data
          </p>
          <button
            onClick={fetchStats}
            className="mt-4 text-xs text-slate-400 border border-slate-600 px-3 py-1.5 rounded hover:text-white hover:border-slate-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const completionRate =
    stats.totalJobs > 0
      ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
      : 0;
  const failureRate =
    stats.totalJobs > 0
      ? Math.round((stats.failedJobs / stats.totalJobs) * 100)
      : 0;
  const activeLoad =
    stats.totalJobs > 0
      ? Math.round((stats.processingJobs / stats.totalJobs) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* ── Top Header Bar ── */}
      <header className="border-b border-l-4 border-l-blue-500 border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {/* Brand logo — ties admin to the main app */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-xs font-bold text-white">LM</span>
          </div>
          <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/40 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
              Admin Console
            </span>
          </div>
          <h1 className="text-sm font-semibold text-slate-300 hidden sm:block">
            System Monitor
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-medium">LIVE</span>
            <span className="hidden sm:inline text-slate-600">
              · {lastRefresh.toLocaleTimeString()}
            </span>
          </div>

          <Link href="/dashboard">
            <button className="text-xs border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 px-3 py-1.5 rounded transition-colors">
              ← Back to App
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs border border-red-800/60 text-red-400 hover:text-red-300 hover:border-red-600/60 px-3 py-1.5 rounded transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── KPI Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-slate-800 divide-x divide-slate-800/80">
        <MetricCell label="Total Users" value={stats.totalUsers} color="blue" />
        <MetricCell label="Total Jobs" value={stats.totalJobs} color="default" />
        <MetricCell label="Completed" value={stats.completedJobs} color="green" />
        <MetricCell label="Failed" value={stats.failedJobs} color="red" />
        <MetricCell label="Active" value={stats.processingJobs} color="amber" />
        <MetricCell label="Candidates" value={stats.totalCandidates} color="purple" />
      </div>

      {/* ── Main Grid ── */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Job Queue Monitor (2/3 width on xl) */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Job Queue Monitor
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Pipeline activity · auto-refreshes every 10s
              </p>
            </div>
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded">
              {stats.recentJobs.length} entries
            </span>
          </div>

          {stats.recentJobs.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-600 text-xs">
              No jobs processed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="text-left px-5 py-2.5 font-medium">Job</th>
                    <th className="text-left px-3 py-2.5 font-medium">User</th>
                    <th className="text-left px-3 py-2.5 font-medium">Status</th>
                    <th className="text-right px-5 py-2.5 font-medium">Results</th>
                    <th className="text-right px-5 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {stats.recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-slate-200 max-w-[180px] truncate">
                        {job.title}
                      </td>
                      <td className="px-3 py-3 text-slate-400 max-w-[130px] truncate">
                        {job.user.email}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill status={job.status} />
                      </td>
                      <td className="px-5 py-3 text-right text-slate-300 tabular-nums">
                        {job.totalCandidatesFound}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500 text-[10px]">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Registry (1/3 width on xl) */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
              User Registry
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {stats.totalUsers} registered account{stats.totalUsers !== 1 ? "s" : ""}
            </p>
          </div>

          {stats.recentUsers.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-600 text-xs">
              No users yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-5 py-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] text-slate-300 font-bold shrink-0">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-200 truncate max-w-[120px]">
                          {user.email}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {user._count.jobs} job{user._count.jobs !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-amber-400 tabular-nums">
                        {user.credits}
                      </p>
                      <p className="text-[10px] text-slate-600">credits</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Health (full width) */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
            Pipeline Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <HealthGauge
              label="Completion Rate"
              value={completionRate}
              color="green"
            />
            <HealthGauge
              label="Failure Rate"
              value={failureRate}
              color="red"
            />
            <HealthGauge
              label="Avg Match Score"
              value={stats.avgMatchScore}
              color="blue"
            />
            <HealthGauge
              label="Active Load"
              value={activeLoad}
              color="amber"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

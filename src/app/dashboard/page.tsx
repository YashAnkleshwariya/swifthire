"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const statusColors: Record<string, string> = {
  PENDING: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md",
  PROCESSING: "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md animate-pulse",
  COMPLETED: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md",
  FAILED: "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md",
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
          totalCandidates: jobsList.reduce(
            (sum: number, j: Job) => sum + j.totalCandidatesFound,
            0
          ),
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh only when there are active jobs on screen
  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (j) => j.status === "PROCESSING" || j.status === "PENDING"
    );
    if (!hasActiveJobs) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [jobs, fetchData]);

  function handleFilterChange(filter: string) {
    setStatusFilter(filter === "All" ? "" : filter);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                AI-powered candidate matching for your job descriptions
              </p>
            </div>
            <Link href="/dashboard/new">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-5 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2 text-xl">+</span> New Job Match
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3 relative z-10">
              <CardDescription className="text-blue-100 font-medium">Credits Remaining</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-5xl font-bold mb-2">{stats?.credits ?? "..."}</p>
              <p className="text-sm text-blue-100 flex items-center gap-1">
                <span>⚡</span>
                ~{stats ? Math.floor(stats.credits / 10) : "..."} job matches available
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3 relative z-10">
              <CardDescription className="text-purple-100 font-medium">Total Jobs Run</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-5xl font-bold mb-2">{stats?.totalJobs ?? "..."}</p>
              <p className="text-sm text-purple-100 flex items-center gap-1">
                <span>🎯</span> Recruitment campaigns
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-3 relative z-10">
              <CardDescription className="text-pink-100 font-medium">Candidates Found</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-5xl font-bold mb-2">{stats?.totalCandidates ?? "..."}</p>
              <p className="text-sm text-pink-100 flex items-center gap-1">
                <span>👥</span> LinkedIn profiles matched
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    📋 Recent Jobs
                  </CardTitle>
                  <CardDescription className="mt-1 dark:text-gray-400">
                    Your job matching requests and results
                  </CardDescription>
                </div>
              </div>

              {/* Status filter pills */}
              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map((s) => {
                  const active = statusFilter === (s === "All" ? "" : s);
                  return (
                    <button
                      key={s}
                      onClick={() => handleFilterChange(s)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              /* Enhanced empty state */
              <div className="text-center py-20 space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto text-5xl">
                  🎯
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {statusFilter ? `No ${statusFilter.toLowerCase()} jobs` : "No job matches yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                  {statusFilter
                    ? `You have no jobs with status "${statusFilter}". Try a different filter.`
                    : "Create your first AI-powered job match to start finding LinkedIn candidates instantly."}
                </p>
                {!statusFilter && (
                  <div className="pt-2">
                    <Link href="/dashboard/new">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        ✨ Create Your First Job Match
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-slate-700/20">
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow
                          key={job.id}
                          className="hover:bg-blue-50/30 dark:hover:bg-slate-700/20 transition-colors"
                        >
                          <TableCell className="font-medium max-w-[220px] truncate text-gray-800 dark:text-gray-200">
                            {job.title}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                            {job.location ?? "—"}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                            {job.experienceLevel ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={statusColors[job.status] ?? ""}
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {job.totalCandidatesFound}
                          </TableCell>
                          <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard/jobs/${job.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-sm hover:shadow-md transition-shadow"
                              >
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {pagination.page} of {pagination.totalPages} · {pagination.total} total jobs
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        ← Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useJobProgress } from "@/hooks/use-job-progress";

interface Evaluation {
  matchScore: number;
  matchBand: "below_50" | "50_to_70" | "above_70";
  whyMatched: string[] | null;
}

interface Candidate {
  id: string;
  name: string;
  linkedinUrl: string;
  profileText: string | null;
  profileTitle: string | null;
  location: string | null;
  rank: number | null;
  exaScore: number | null;
  evaluation: Evaluation | null;
}

interface Job {
  id: string;
  title: string;
  location: string | null;
  status: string;
  searchQuery: string | null;
  totalCandidatesFound: number;
  createdAt: string;
}

type SortKey = "rank" | "overall";

const stepLabels: Record<string, string> = {
  GENERATING_QUERY: "🤖 Generating AI search query...",
  SEARCHING_LINKEDIN: "🔍 Searching LinkedIn profiles...",
  SAVING_CANDIDATES: "💾 Saving candidate profiles...",
  EVALUATING_CANDIDATES: "⭐ Evaluating candidates with AI...",
  RANKING_RESULTS: "🏆 Ranking results by match score...",
  DONE: "✅ Complete!",
  WAITING: "⏳ Queued, waiting for worker...",
};

const jobStatusColors: Record<string, string> = {
  COMPLETED: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md",
  FAILED: "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md",
  PROCESSING: "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md animate-pulse",
  PENDING: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md",
};

function scoreGradient(score: number): string {
  if (score >= 80) return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm";
  if (score >= 60) return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm";
  return "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-sm";
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}


function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-3">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [minMatch, setMinMatch] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const progress = useJobProgress(jobId);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setIsAdmin(data.data.isAdmin ?? false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/jobs/${jobId}/results`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        setCandidates(data.candidates ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch job data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank");
    }
  }

  const sortedCandidates = useMemo(() => {
    const filtered = candidates.filter(
      (c) => (c.evaluation?.matchScore ?? 0) >= minMatch
    );

    return [...filtered].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (sortKey) {
        case "rank":
          aVal = a.rank ?? 999;
          bVal = b.rank ?? 999;
          break;
        case "overall":
          aVal = a.evaluation?.matchScore ?? 0;
          bVal = b.evaluation?.matchScore ?? 0;
          break;
      }

      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [candidates, sortKey, sortAsc, minMatch]);

  function exportCSV() {
    const headers = [
      "Rank",
      "Name",
      "LinkedIn URL",
      "Title",
      "Location",
      "Match Score",
      "Match Band",
      "Why Matched",
    ];

    const rows = sortedCandidates.map((c) => [
      c.rank ?? "",
      c.name,
      c.linkedinUrl,
      c.profileTitle ?? "",
      c.location ?? "",
      c.evaluation?.matchScore ?? "",
      c.evaluation?.matchBand ?? "",
      `"${(c.evaluation?.whyMatched ?? []).join("; ").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${jobId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen bg-[#080b14]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen bg-[#080b14]">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  const SortHeader = ({
    label,
    sortId,
    className,
  }: {
    label: string;
    sortId: SortKey;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer select-none hover:bg-white/5 ${className ?? ""}`}
      onClick={() => handleSort(sortId)}
    >
      {label} {sortKey === sortId ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-[#080b14] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {job.title}
          </h1>
          <p className="text-gray-500 mt-1">
            {job.location ?? "No location"} · Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Job Summary Card */}
        <Card className="mb-6 border-0 shadow-xl bg-white/[0.04] border border-white/[0.07]">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Job Summary</CardTitle>
                <CardDescription>
                  {job.totalCandidatesFound} candidate{job.totalCandidatesFound !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={jobStatusColors[job.status] ?? "bg-gray-100 text-gray-800"}
              >
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          {job.searchQuery && isAdmin && (
            <CardContent>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-semibold px-2 py-0.5 rounded">
                  Admin only
                </span>
                Generated Search Query:
              </p>
              <div className="flex items-start gap-2">
                <p className="text-sm bg-white/[0.06] p-3 rounded-md font-mono flex-1 text-gray-300">
                  {job.searchQuery}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(job.searchQuery ?? "")
                  }
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Processing Progress — with prominent step label */}
        {progress.isProcessing && (
          <Card className="mb-6 border-0 shadow-xl bg-white/[0.04] border border-white/[0.07]">
            <CardHeader>
              <CardTitle className="text-lg">Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Prominent step display */}
              {progress.currentStep && (
                <div className="flex items-center gap-3 bg-blue-500/10 rounded-xl px-4 py-3 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex-1">
                    {stepLabels[progress.currentStep] ??
                      progress.currentStep.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {progress.progress}%
                  </span>
                </div>
              )}
              <ProgressBar progress={progress.progress} />
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {progress.isFailed && progress.error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400 text-sm">
                ❌ Error: {progress.error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {candidates.length > 0 && (
          <Card className="border-0 shadow-2xl bg-white/[0.04] border border-white/[0.07]">
            <CardHeader className="border-b border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-white">
                    🏆 Ranked Candidates ({sortedCandidates.length}
                    {minMatch > 0 ? ` of ${candidates.length}` : ""})
                  </CardTitle>
                  <CardDescription>
                    Sorted by AI match score · click column headers to reorder
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400 whitespace-nowrap">
                      Min match:
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={minMatch}
                      onChange={(e) => setMinMatch(Number(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCSV}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    ⬇ Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/[0.03]">
                      <SortHeader label="#" sortId="rank" className="w-12" />
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <SortHeader label="Match %" sortId="overall" className="text-center" />
                      <TableHead className="text-center">Band</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCandidates.map((c) => (
                      <TableRow
                        key={c.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <TableCell className="font-bold text-gray-700 dark:text-gray-300">
                          {c.rank ?? "-"}
                        </TableCell>
                        <TableCell>
                          <a
                            href={c.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {c.name}
                          </a>
                        </TableCell>
                        <TableCell className="text-sm text-gray-400 max-w-[200px] truncate">
                          {c.profileTitle ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {c.location ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={scoreGradient(c.evaluation?.matchScore ?? 0)}>
                            {c.evaluation?.matchScore ?? "-"}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {c.evaluation?.matchBand && (
                            <Badge variant="secondary" className={
                              c.evaluation.matchBand === "above_70"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : c.evaluation.matchBand === "50_to_70"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }>
                              {c.evaluation.matchBand.replace("_", " ")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <CandidateDetailDialog candidate={c} scoreColor={scoreColor} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CandidateDetailDialog({
  candidate,
  scoreColor,
}: {
  candidate: Candidate;
  scoreColor: (n: number) => string;
}) {
  const eval_ = candidate.evaluation;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{candidate.name}</DialogTitle>
          <DialogDescription>{candidate.profileTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div>
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              Open LinkedIn Profile →
            </a>
          </div>

          {eval_ && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 p-3 bg-white/[0.06] rounded-lg flex-1">
                  <span className="text-sm text-gray-400">Match Score</span>
                  <span className={`font-bold text-lg ${scoreColor(eval_.matchScore)}`}>
                    {eval_.matchScore}%
                  </span>
                </div>
                <Badge variant="secondary" className={
                  eval_.matchBand === "above_70"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1"
                    : eval_.matchBand === "50_to_70"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-3 py-1"
                }>
                  {eval_.matchBand.replace("_", " ")}
                </Badge>
              </div>

              {eval_.whyMatched && eval_.whyMatched.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-white">Why Matched</h4>
                  <ul className="space-y-1.5">
                    {eval_.whyMatched.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {candidate.profileText && (
            <div>
              <h4 className="font-semibold mb-2 text-white">Profile Text</h4>
              <p className="text-sm text-gray-400 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidate.profileText}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

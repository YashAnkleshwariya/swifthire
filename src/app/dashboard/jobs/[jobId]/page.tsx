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

const PIPELINE_STEPS = [
  "WAITING",
  "GENERATING_QUERY",
  "SEARCHING_LINKEDIN",
  "SAVING_CANDIDATES",
  "EVALUATING_CANDIDATES",
  "RANKING_RESULTS",
  "DONE",
] as const;

function ProcessingScreen({
  jobTitle,
  currentStep,
  progress,
}: {
  jobTitle: string;
  currentStep: string | null;
  progress: number;
}) {
  const currentIdx = currentStep
    ? PIPELINE_STEPS.indexOf(currentStep as typeof PIPELINE_STEPS[number])
    : 0;

  return (
    <div className="min-h-screen bg-background bg-dot-grid flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Spinner with pulse rings */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="pulse-ring" />
            <div className="pulse-ring pulse-ring-2" />
            <div className="pulse-ring pulse-ring-3" />
            <div className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin relative z-10" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{jobTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1">Processing your job match…</p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-2">
          {PIPELINE_STEPS.filter((s) => s !== "DONE").map((step, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : isDone
                    ? "opacity-60"
                    : "opacity-30"
                }`}
              >
                {isDone ? (
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : isCurrent ? (
                  <span className="w-5 h-5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${isCurrent ? "text-blue-400" : "text-foreground"}`}>
                  {stepLabels[step] ?? step.replace(/_/g, " ")}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-xs font-bold font-data tabular-nums text-blue-400">{progress}%</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground font-data tabular-nums">{progress}% complete</p>
        </div>
      </div>
    </div>
  );
}

function FailedScreen({
  error,
  onBack,
}: {
  error: string | null;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Job Processing Failed</h2>
          {error && <p className="text-sm text-muted-foreground mt-2">{error}</p>}
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function scoreGradient(score: number): string {
  if (score >= 80) return "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm";
  if (score >= 60) return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm";
  return "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-sm";
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen bg-background">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  // Processing state — full-screen only
  if (progress.isProcessing || job.status === "PENDING") {
    return (
      <ProcessingScreen
        jobTitle={job.title}
        currentStep={progress.currentStep}
        progress={progress.progress}
      />
    );
  }

  // Failed state
  if (progress.isFailed || job.status === "FAILED") {
    return (
      <FailedScreen
        error={progress.error}
        onBack={() => router.push("/dashboard")}
      />
    );
  }

  // Results state
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
      className={`cursor-pointer select-none hover:bg-surface-1 ${className ?? ""}`}
      onClick={() => handleSort(sortId)}
    >
      {label} {sortKey === sortId ? (sortAsc ? "↑" : "↓") : ""}
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-background bg-dot-grid p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {job.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {job.location ?? "No location"} · Created {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Job Summary Card */}
        <Card className="mb-6 border-0 shadow-xl bg-surface-1 border border-subtle">
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
                className={jobStatusColors[job.status] ?? "bg-muted text-muted-foreground"}
              >
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          {job.searchQuery && isAdmin && (
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <span className="bg-red-500/10 text-red-500 text-xs font-semibold px-2 py-0.5 rounded">
                  Admin only
                </span>
                Generated Search Query:
              </p>
              <div className="flex items-start gap-2">
                <p className="text-sm bg-surface-2 p-3 rounded-md font-mono flex-1 text-muted-foreground">
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

        {/* Results Table */}
        {candidates.length > 0 && (
          <Card className="border-0 shadow-2xl bg-surface-1 border border-subtle">
            <CardHeader className="border-b border-subtle bg-surface-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    🏆 Ranked Candidates ({sortedCandidates.length}
                    {minMatch > 0 ? ` of ${candidates.length}` : ""})
                  </CardTitle>
                  <CardDescription>
                    Sorted by AI match score · click column headers to reorder
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">
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
                    <span className="text-sm text-muted-foreground">%</span>
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
                    <TableRow className="bg-surface-1">
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
                        className="hover:bg-surface-1 transition-colors"
                      >
                        <TableCell className="font-bold font-data text-muted-foreground tabular-nums">
                          {c.rank ?? "-"}
                        </TableCell>
                        <TableCell>
                          <a
                            href={c.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                          >
                            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="group-hover:underline">{c.name}</span>
                          </a>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {c.profileTitle ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.location ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${scoreGradient(c.evaluation?.matchScore ?? 0)} font-data tabular-nums`}>
                            {c.evaluation?.matchScore ?? "-"}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {c.evaluation?.matchBand && (
                            <Badge variant="secondary" className={
                              c.evaluation.matchBand === "above_70"
                                ? "bg-green-500/10 text-green-500"
                                : c.evaluation.matchBand === "50_to_70"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-red-500/10 text-red-500"
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
              className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
            >
              Open LinkedIn Profile →
            </a>
          </div>

          {eval_ && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 p-3 bg-surface-1 rounded-lg flex-1">
                  <span className="text-sm text-muted-foreground">Match Score</span>
                  <span className={`font-bold text-lg font-data tabular-nums ${scoreColor(eval_.matchScore)}`}>
                    {eval_.matchScore}%
                  </span>
                </div>
                <Badge variant="secondary" className={
                  eval_.matchBand === "above_70"
                    ? "bg-green-500/10 text-green-500 px-3 py-1"
                    : eval_.matchBand === "50_to_70"
                    ? "bg-yellow-500/10 text-yellow-500 px-3 py-1"
                    : "bg-red-500/10 text-red-500 px-3 py-1"
                }>
                  {eval_.matchBand.replace("_", " ")}
                </Badge>
              </div>

              {eval_.whyMatched && eval_.whyMatched.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Why Matched</h4>
                  <ul className="space-y-1.5">
                    {eval_.whyMatched.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
              <h4 className="font-semibold mb-2 text-foreground">Profile Text</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {candidate.profileText}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

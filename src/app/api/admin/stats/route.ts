import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    await requireAdmin();
    const admin = getAdminClient();

    const [
      { count: totalUsers },
      { count: totalJobs },
      { count: completedJobs },
      { count: failedJobs },
      { count: processingJobs },
      { count: totalCandidates },
      { data: recentJobs },
      { data: recentUsers },
      { data: avgScoreData },
    ] = await Promise.all([
      admin.from("User").select("*", { count: "exact", head: true }),
      admin.from("Job").select("*", { count: "exact", head: true }),
      admin.from("Job").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
      admin.from("Job").select("*", { count: "exact", head: true }).eq("status", "FAILED"),
      admin.from("Job").select("*", { count: "exact", head: true }).in("status", ["PENDING", "PROCESSING"]),
      admin.from("Candidate").select("*", { count: "exact", head: true }),
      admin
        .from("Job")
        .select("id, title, status, totalCandidatesFound, createdAt, user:User(email)")
        .order("createdAt", { ascending: false })
        .limit(10),
      admin
        .from("User")
        .select("id, email, name, credits, createdAt, jobs:Job(count)")
        .order("createdAt", { ascending: false })
        .limit(10),
      admin.from("Evaluation").select("matchScore"),
    ]);

    const scores = (avgScoreData as { matchScore: number }[] | null) ?? [];
    const avgMatchScore = scores.length
      ? Math.round(scores.reduce((s, e) => s + e.matchScore, 0) / scores.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers ?? 0,
        totalJobs: totalJobs ?? 0,
        completedJobs: completedJobs ?? 0,
        failedJobs: failedJobs ?? 0,
        processingJobs: processingJobs ?? 0,
        totalCandidates: totalCandidates ?? 0,
        avgMatchScore,
        recentJobs: recentJobs ?? [],
        recentUsers: (recentUsers ?? []).map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          credits: u.credits,
          createdAt: u.createdAt,
          _count: { jobs: u.jobs?.[0]?.count ?? 0 },
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

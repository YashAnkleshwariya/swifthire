import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();
    const admin = getAdminClient();

    const { data: job, error: jobError } = await admin
      .from("Job")
      .select("id, title, location, status, totalCandidatesFound, createdAt, searchQuery, userId")
      .eq("id", params.jobId)
      .single();

    if (jobError || !job) throw new NotFoundError("Job not found");
    const jobData = job as { id: string; title: string; location: string | null; status: string; totalCandidatesFound: number; createdAt: string; searchQuery: string | null; userId: string };
    if (jobData.userId !== user.id && !user.isAdmin) throw new AuthorizationError("Access denied");

    const { userId: _userId, searchQuery, ...baseFields } = jobData;
    const jobResponse = user.isAdmin ? { ...baseFields, searchQuery } : baseFields;

    const { data: candidates, error: candidatesError } = await admin
      .from("Candidate")
      .select("*, evaluation:Evaluation(*)")
      .eq("jobId", params.jobId)
      .order("rank", { ascending: true });

    if (candidatesError) throw new Error(candidatesError.message);

    return NextResponse.json({ success: true, job: jobResponse, candidates: candidates ?? [] });
  } catch (error) {
    return handleApiError(error);
  }
}

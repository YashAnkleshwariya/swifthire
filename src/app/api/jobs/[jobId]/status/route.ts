import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("ProcessingJob")
      .select("status, currentStep, progress, error, startedAt, completedAt, job:Job(userId)")
      .eq("jobId", params.jobId)
      .single();

    if (error || !data) throw new NotFoundError("Processing job not found");

    const jobArr = data.job as { userId: string }[] | null;
    const jobRecord = Array.isArray(jobArr) ? jobArr[0] : null;
    if (jobRecord?.userId !== user.id && !user.isAdmin) throw new AuthorizationError("Access denied");

    return NextResponse.json({
      status: data.status,
      currentStep: data.currentStep,
      progress: data.progress,
      error: data.error,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    const { data: job, error } = await admin
      .from("Job")
      .select("*, processingJob:ProcessingJob(*)")
      .eq("id", params.jobId)
      .single();

    if (error || !job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) throw new AuthorizationError("Access denied");

    return NextResponse.json({ success: true, job });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();
    const admin = getAdminClient();

    const { data: job, error } = await admin.from("Job").select("*").eq("id", params.jobId).single();
    if (error || !job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) throw new AuthorizationError("Access denied");

    if (job.status === "PENDING") {
      const newCredits = user.credits + job.creditsUsed;
      const now = new Date().toISOString();
      await admin.from("User").update({ credits: newCredits, updatedAt: now }).eq("id", user.id);
      await admin.from("CreditTransaction").insert({
        id: crypto.randomUUID(),
        userId: user.id,
        amount: job.creditsUsed,
        type: "REFUND",
        jobId: job.id,
        source: "job_cancelled",
        createdAt: now,
      });
    }

    await admin.from("Job").delete().eq("id", params.jobId);

    return NextResponse.json({ success: true, refunded: job.status === "PENDING" ? job.creditsUsed : 0 });
  } catch (error) {
    return handleApiError(error);
  }
}

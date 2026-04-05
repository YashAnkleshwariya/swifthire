import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { inngest } from "@/inngest/client";
import { createJobSchema } from "@/lib/validations/job";
import { handleApiError, InsufficientCreditsError } from "@/lib/errors";
const CREDIT_COST = 10;

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (user.credits < CREDIT_COST) {
      throw new InsufficientCreditsError(CREDIT_COST, user.credits);
    }

    const body = await req.json();
    const validated = createJobSchema.parse(body);

    const title = validated.description
      .split("\n").map((l) => l.trim()).find((l) => l.length > 3)
      ?.substring(0, 200) ?? "Job Match";

    const admin = getAdminClient();
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: jobError } = await admin.from("Job").insert({
      id: jobId,
      userId: user.id,
      title,
      description: validated.description,
      location: validated.location ?? null,
      experienceLevel: validated.experienceLevel ?? null,
      candidateLimit: validated.candidateLimit,
      status: "PENDING",
      creditsUsed: CREDIT_COST,
      totalCandidatesFound: 0,
      createdAt: now,
      updatedAt: now,
    });
    if (jobError) throw new Error(jobError.message);

    await admin.from("ProcessingJob").insert({
      id: crypto.randomUUID(),
      jobId,
      status: "QUEUED",
      currentStep: "WAITING",
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });

    const newCredits = user.credits - CREDIT_COST;
    await admin.from("User").update({ credits: newCredits, updatedAt: now }).eq("id", user.id);

    await admin.from("CreditTransaction").insert({
      id: crypto.randomUUID(),
      userId: user.id,
      amount: -CREDIT_COST,
      type: "DEDUCT",
      jobId,
      source: "job_creation",
      createdAt: now,
    });

    await inngest.send({ name: "job/process", data: { jobId } });

    return NextResponse.json(
      { success: true, jobId, status: "QUEUED", creditsRemaining: newCredits },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

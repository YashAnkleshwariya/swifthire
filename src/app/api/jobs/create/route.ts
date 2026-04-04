import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

    const title =
      validated.description
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 3)
        ?.substring(0, 200) ?? "Job Match";

    const { job, newCredits } = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          userId: user.id,
          title,
          description: validated.description,
          location: validated.location,
          experienceLevel: validated.experienceLevel,
          candidateLimit: validated.candidateLimit,
          status: "PENDING",
          creditsUsed: CREDIT_COST,
        },
      });

      await tx.processingJob.create({
        data: { jobId: newJob.id, status: "QUEUED", currentStep: "WAITING" },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: CREDIT_COST } },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -CREDIT_COST,
          type: "DEDUCT",
          jobId: newJob.id,
          source: "job_creation",
        },
      });

      return { job: newJob, newCredits: updatedUser.credits };
    });

    // Trigger Inngest function (replaces BullMQ queue.add)
    await inngest.send({ name: "job/process", data: { jobId: job.id } });

    return NextResponse.json(
      { success: true, jobId: job.id, status: "QUEUED", creditsRemaining: newCredits },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

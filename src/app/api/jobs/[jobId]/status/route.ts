import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const processingJob = await prisma.processingJob.findUnique({
      where: { jobId: params.jobId },
      select: {
        status: true,
        currentStep: true,
        progress: true,
        error: true,
        startedAt: true,
        completedAt: true,
        job: { select: { userId: true } },
      },
    });

    if (!processingJob) throw new NotFoundError("Processing job not found");

    if (processingJob.job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("Access denied");
    }

    return NextResponse.json({
      status: processingJob.status,
      currentStep: processingJob.currentStep,
      progress: processingJob.progress,
      error: processingJob.error,
      startedAt: processingJob.startedAt,
      completedAt: processingJob.completedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

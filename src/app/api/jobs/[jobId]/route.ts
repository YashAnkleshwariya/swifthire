import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors";
import { refundCredits } from "@/lib/billing/credits";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      include: { processingJob: true },
    });

    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("You do not have access to this job");
    }

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

    const job = await prisma.job.findUnique({ where: { id: params.jobId } });

    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== user.id && !user.isAdmin) {
      throw new AuthorizationError("You do not have access to this job");
    }

    if (job.status === "PENDING") {
      await refundCredits(user.id, job.creditsUsed, job.id);
    }

    await prisma.job.delete({ where: { id: params.jobId } });

    return NextResponse.json({
      success: true,
      refunded: job.status === "PENDING" ? job.creditsUsed : 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await requireUser();

    const baseSelect = {
      id: true,
      title: true,
      location: true,
      status: true,
      totalCandidatesFound: true,
      createdAt: true,
    };

    const job = await prisma.job.findUnique({
      where: { id: params.jobId },
      select: user.isAdmin ? { ...baseSelect, searchQuery: true } : baseSelect,
    });

    if (!job) throw new NotFoundError("Job not found");

    const candidates = await prisma.candidate.findMany({
      where: { jobId: params.jobId },
      orderBy: { rank: "asc" },
      include: { evaluation: true },
    });

    return NextResponse.json({ success: true, job, candidates });
  } catch (error) {
    return handleApiError(error);
  }
}

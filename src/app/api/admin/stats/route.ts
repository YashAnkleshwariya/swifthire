import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalJobs,
      completedJobs,
      failedJobs,
      processingJobs,
      totalCandidates,
      recentJobs,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.job.count({ where: { status: "FAILED" } }),
      prisma.job.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
      prisma.candidate.count(),
      prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          totalCandidatesFound: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          createdAt: true,
          _count: { select: { jobs: true } },
        },
      }),
    ]);

    const avgScore = await prisma.evaluation.aggregate({
      _avg: { matchScore: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        completedJobs,
        failedJobs,
        processingJobs,
        totalCandidates,
        avgMatchScore: Math.round(avgScore._avg.matchScore ?? 0),
        recentJobs,
        recentUsers,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import prisma from "@/lib/prisma";

/**
 * Refund credits to a user for a cancelled job
 * @param userId - The ID of the user
 * @param amount - The amount of credits to refund
 * @param jobId - The ID of the job being cancelled
 */
export async function refundCredits(userId: string, amount: number, jobId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

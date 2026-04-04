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

export async function addCredits(userId: string, amount: number, reason: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

export const PRICING = {
  FREE: { credits: 100, price: 0, label: "Free", dodoProductId: null },
  PRO: { credits: 300, price: 29, label: "Pro - $29/mo", dodoProductId: "dodo_prod_xxx" },
  ENTERPRISE: { credits: 1000, price: 99, label: "Enterprise - $99/mo", dodoProductId: "dodo_prod_yyy" },
  CREDITS_100: { credits: 100, price: 9, label: "100 Credits - $9", dodoProductId: "dodo_prod_zzz" },
} as const;

export const CREDIT_COST_PER_JOB = 10;

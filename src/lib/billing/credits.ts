import { getAdminClient } from "@/lib/supabase/admin";

export async function refundCredits(userId: string, amount: number, _jobId: string): Promise<void> {
  const admin = getAdminClient();
  const { data } = await admin.from("User").select("credits").eq("id", userId).single();
  const current = (data as { credits: number } | null)?.credits ?? 0;
  await admin.from("User").update({ credits: current + amount, updatedAt: new Date().toISOString() }).eq("id", userId);
}

export async function addCredits(userId: string, amount: number, _reason: string): Promise<void> {
  const admin = getAdminClient();
  const { data } = await admin.from("User").select("credits").eq("id", userId).single();
  const current = (data as { credits: number } | null)?.credits ?? 0;
  await admin.from("User").update({ credits: current + amount, updatedAt: new Date().toISOString() }).eq("id", userId);
}

export const PRICING = {
  FREE: { credits: 100, price: 0, label: "Free", dodoProductId: null },
  PRO: { credits: 300, price: 29, label: "Pro - $29/mo", dodoProductId: "dodo_prod_xxx" },
  ENTERPRISE: { credits: 1000, price: 99, label: "Enterprise - $99/mo", dodoProductId: "dodo_prod_yyy" },
  CREDITS_100: { credits: 100, price: 9, label: "100 Credits - $9", dodoProductId: "dodo_prod_zzz" },
} as const;

export const CREDIT_COST_PER_JOB = 10;

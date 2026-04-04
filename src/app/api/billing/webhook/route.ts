import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { addCredits, PRICING } from "@/lib/billing/credits";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY ?? "placeholder",
  environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
});

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] DODO_WEBHOOK_SECRET is not set — rejecting all webhook calls.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
  };

  try {
    const event = dodo.webhooks.unwrap(payload, { headers, key: webhookSecret }) as {
      type: string;
      data: { metadata?: { userId?: string; planId?: string } };
    };

    if (event.type === "payment.succeeded") {
      const { userId, planId } = event.data.metadata ?? {};

      if (userId && planId && planId in PRICING) {
        const plan = PRICING[planId as keyof typeof PRICING];
        if (plan.price > 0) {
          await addCredits(userId, plan.credits, `purchase:${planId}`);
          console.log(`[Webhook] Added ${plan.credits} credits to user ${userId} for plan ${planId}`);
        }
      } else {
        console.warn("[Webhook] payment.succeeded missing userId or planId in metadata", {
          userId,
          planId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Verification or processing failed:", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}

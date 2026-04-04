import { NextRequest, NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { requireUser } from "@/lib/auth";
import { PRICING } from "@/lib/billing/credits";
import { handleApiError } from "@/lib/errors";

function getDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { planId } = await req.json();

    if (!planId || !(planId in PRICING)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 });
    }

    const plan = PRICING[planId as keyof typeof PRICING];

    if (plan.price === 0) {
      return NextResponse.json({ success: true, message: "You are already on the Free plan." });
    }

    if (!plan.dodoProductId) {
      return NextResponse.json({ success: false, error: "Plan not available" }, { status: 400 });
    }

    const dodo = getDodoClient();
    const payment = await dodo.payments.create({
      billing: {
        city: ".",
        country: "US",
        state: ".",
        street: ".",
        zipcode: "00000",
      },
      customer: {
        email: user.email,
        name: user.name ?? user.email,
        create_new_customer: false,
      } as unknown as Parameters<typeof dodo.payments.create>[0]["customer"],
      product_cart: [{ product_id: plan.dodoProductId, quantity: 1 }],
      metadata: { userId: user.id, planId },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      payment_link: true,
    });

    return NextResponse.json({
      success: true,
      url: (payment as unknown as { payment_link: string }).payment_link,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

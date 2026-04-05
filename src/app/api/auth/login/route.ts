import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, AuthenticationError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      throw new AuthenticationError("Email and password are required");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const msg = error?.message ?? "Invalid email or password";
      throw new AuthenticationError(
        msg.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email address before signing in, or contact support."
          : "Invalid email or password"
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ValidationError } from "@/lib/errors";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: validated.email.toLowerCase(),
      password: validated.password,
      options: {
        data: { name: validated.name.trim() },
      },
    });

    if (error || !data.user) {
      throw new ValidationError(error?.message ?? "Registration failed");
    }

    const admin = getAdminClient();

    // Check whether a profile row already exists for this auth user.
    // signUp() returns the existing user without error when email confirmations
    // are disabled, so we must guard against re-inserting with credits: 100.
    const { data: existingProfile } = await admin
      .from("User")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (existingProfile) {
      // User already has a profile — this is effectively a duplicate registration
      // attempt. Return success so the client is redirected normally, but do NOT
      // touch credits or any other field.
      return NextResponse.json(
        { success: true, user: { id: data.user.id, email: data.user.email, name: validated.name.trim() } },
        { status: 201 }
      );
    }

    const { error: dbError } = await admin.from("User").insert({
      id: data.user.id,
      email: validated.email.toLowerCase(),
      name: validated.name.trim(),
      credits: 100,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (dbError) {
      throw new ValidationError(`DB_INSERT_FAILED: ${dbError.message} (code: ${dbError.code})`);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: validated.name.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

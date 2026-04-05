import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

    // Create Supabase Auth user
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

    // Use Supabase admin client (HTTPS/PostgREST) instead of Prisma TCP connection
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      console.error("Supabase insert error:", dbError);
      throw new ValidationError(`Database error: ${dbError.message}`);
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

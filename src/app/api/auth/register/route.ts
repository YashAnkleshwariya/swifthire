import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
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

    // Create app User row linked to the Supabase Auth UUID
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: validated.email.toLowerCase(),
          name: validated.name.trim(),
          credits: 100,
        },
      });
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      const code = (dbError as Record<string, unknown>)?.code;
      const meta = (dbError as Record<string, unknown>)?.meta;
      console.error("DB_ERROR_DETAILS:", JSON.stringify({ msg, code, meta }));
      return NextResponse.json(
        { success: false, error: `DB: ${msg} | code: ${code} | meta: ${JSON.stringify(meta)}` },
        { status: 500 }
      );
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

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
  console.log("STEP1: register route started");
  try {
    const body = await req.json();
    console.log("STEP2: body parsed");
    const validated = registerSchema.parse(body);
    console.log("STEP3: schema validated");

    const supabase = await createClient();
    console.log("STEP4: supabase client created");

    // Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email: validated.email.toLowerCase(),
      password: validated.password,
      options: {
        data: { name: validated.name.trim() },
      },
    });

    console.log("STEP5: signUp result", { userId: data?.user?.id, error: error?.message });

    if (error || !data.user) {
      throw new ValidationError(error?.message ?? "Registration failed");
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    console.log("STEP6: admin client created");

    const { error: dbError } = await admin.from("User").insert({
      id: data.user.id,
      email: validated.email.toLowerCase(),
      name: validated.name.trim(),
      credits: 100,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log("STEP7: insert result", { dbError: dbError?.message, code: dbError?.code });

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

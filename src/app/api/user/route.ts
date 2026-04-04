import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

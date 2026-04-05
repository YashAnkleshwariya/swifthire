import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
    const status = url.searchParams.get("status");

    const admin = getAdminClient();
    let query = admin
      .from("Job")
      .select("id, title, location, experienceLevel, status, totalCandidatesFound, createdAt", { count: "exact" })
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq("status", status);

    const { data: jobs, count, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      jobs: jobs ?? [],
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

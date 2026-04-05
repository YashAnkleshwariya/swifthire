import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { AuthenticationError, AuthorizationError } from "./errors";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data } = await admin
    .from("User")
    .select("id, email, name, credits, isAdmin")
    .eq("id", user.id)
    .single();

  return data as { id: string; email: string; name: string | null; credits: number; isAdmin: boolean } | null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError("You must be logged in to access this resource");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new AuthorizationError("Admin access required");
  return user;
}

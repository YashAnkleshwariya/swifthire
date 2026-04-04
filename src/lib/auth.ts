import { createClient } from "@/lib/supabase/server";
import { AuthenticationError, AuthorizationError } from "./errors";
import prisma from "./prisma";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      isAdmin: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthenticationError("You must be logged in to access this resource");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    throw new AuthorizationError("Admin access required");
  }
  return user;
}

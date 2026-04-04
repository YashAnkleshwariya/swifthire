import { defineConfig } from "prisma/config";

// DATABASE_URL: Supabase pooled connection string (port 6543) — used at runtime
// DIRECT_URL: Supabase direct connection (port 5432) — used only by prisma migrate
export default defineConfig({
  schema: "prisma/schema.prisma",
});

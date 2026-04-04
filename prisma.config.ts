import { defineConfig } from "prisma/config";

// DATABASE_URL: Supabase pooled connection string (port 6543) — used at runtime
// DIRECT_URL: Supabase direct connection (port 5432) — used only by prisma migrate
export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrate: {
    async adapter(env) {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      return new PrismaPg({ connectionString: env.DIRECT_URL });
    },
  },
});

// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // env() is a helper that throws a clear error if the variable is missing
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node prisma/seed.ts',
  }
});
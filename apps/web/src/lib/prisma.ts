import { PrismaClient } from "@prisma/client";

// Bump the key to force a fresh client when schema changes (e.g., new fields like isAppend)
declare global {
  // eslint-disable-next-line no-var
  var prisma_v3: PrismaClient | undefined;
}

export const prisma =
  global.prisma_v3 ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma_v3 = prisma;
}

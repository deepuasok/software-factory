/**
 * The one Prisma client.
 *
 * Next.js reloads modules in development, so a plain `new PrismaClient()` at
 * module scope opens a new pool on every save and eventually exhausts the
 * database handles. Stashing it on `globalThis` is the standard fix.
 */

import { PrismaClient } from "@prisma/client";

const store = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  store.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") store.prisma = prisma;

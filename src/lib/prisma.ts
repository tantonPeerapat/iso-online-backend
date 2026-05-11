import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const accelerateUrl = process.env.PRISMA_ACCELERATE_URL?.trim();
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!accelerateUrl && !databaseUrl) {
  throw new Error(
    "Missing PRISMA_ACCELERATE_URL or DATABASE_URL in environment variables.",
  );
}

const prismaClient = accelerateUrl
  ? new PrismaClient({
      accelerateUrl,
      log: ["warn", "error"],
    })
  : new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl as string }),
      log: ["warn", "error"],
    });

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

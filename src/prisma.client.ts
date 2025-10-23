import { PrismaClient } from "@/generated/prisma";
import { env } from "./common/utils/envConfig";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ["query", "error", "warn"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function connectDatabase() {
  try {
    console.log(">>> [Connecting Database] <<<");
    await prisma.$connect();
    console.log("✓ Database connected");
    setInterval(async () => {
      try {
        await prisma.account.findFirst({ take: 1 });
      } catch (error) {
        console.error("Health check failed:", error);
      }
    }, 30000);
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    console.log(">>> [Disconnecting Database] <<<");
    await prisma.$disconnect();
    console.log("✓ Database connected");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

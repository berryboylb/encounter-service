// import type { PrismaClient } from "@prisma/client";
import { PrismaClient, Account } from "@/generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

export {};

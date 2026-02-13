import { PrismaClient } from "./lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ url: process.env.DATABASE_URL }), // required
  log: ["query", "info", "warn", "error"],
});
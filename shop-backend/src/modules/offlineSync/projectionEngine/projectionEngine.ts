
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { PrismaProjectionRepository } from "./prismaProjectionRepo.js";
import { OperationalProjectionEngine } from "@business/projection-families"

export function CreateProjectionEngine(
  tx: Prisma.TransactionClient
) {
  const repo = new PrismaProjectionRepository(tx);
  const projectionEngine =
    new OperationalProjectionEngine(repo);
  
  return projectionEngine
}

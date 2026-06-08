import { SnapshotEngine } from "@business/snapshot-engine";
import { PrismaSnapshotRepo } from "./repository/snapshotRepository.js";
import { Prisma } from "../../infrastructure/postgresql/prisma/generated/client.js";
import { createSnapshotRegistry } from "./backendSnapshotRegistry.js";

const registry = createSnapshotRegistry()
export function createSnapshotEngine(
  tx: Prisma.TransactionClient
) {

  const snapshotRepo =
    new PrismaSnapshotRepo(tx);

  return new SnapshotEngine(
    snapshotRepo,
    registry
  );
}
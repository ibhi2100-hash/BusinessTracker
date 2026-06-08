// infrastructure/ledger/backendLedgerEngine.ts

import {
  LedgerEngine,
  generateLedgerEntries
} from "@business/ledger-engine";

import { PrismaEventStore } from "../../modules/offlineSync/repository/PrismaEventStore.js";
import { PrismaProjectionEngine } from "../../modules/offlineSync/projectionEngine/projectionEngine.js";
import { PrismaVersionManager } from "../../modules/offlineSync/versionManager/versionManager.js";
import { Prisma } from "../postgresql/prisma/generated/client.js";
import { createSnapshotEngine } from "../../modules/snapshot/SnapShotEngine.js";
import { SyncRepository } from "../../modules/offlineSync/repository/syncRepository.js";

export function createBackendLedgerEngine(
  tx: Prisma.TransactionClient
) {
  const repo = new SyncRepository();

  return new LedgerEngine({
    eventStore: new PrismaEventStore(repo, tx),
    snapshotEngine: createSnapshotEngine(tx),
    projectionEngine: new PrismaProjectionEngine(tx),
    ledgerGenerator: generateLedgerEntries,
    versionManager: new PrismaVersionManager(tx),
  });
}
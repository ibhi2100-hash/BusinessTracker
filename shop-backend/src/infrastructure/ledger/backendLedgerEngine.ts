// infrastructure/ledger/backendLedgerEngine.ts

import {
  LedgerEngine,
  generateLedgerEntries
} from "@business/ledger-engine";

import { PrismaEventStore } from "../../modules/offlineSync/repository/PrismaEventStore.js";
import { CreateProjectionEngine } from "../../modules/offlineSync/projectionEngine/projectionEngine.js";
import { PrismaVersionManager } from "../../modules/offlineSync/versionManager/versionManager.js";
import { Prisma } from "../postgresql/prisma/generated/client.js";
import { createSnapshotEngine } from "../../modules/snapshot/SnapShotEngine.js";
import { SyncRepository } from "../../modules/offlineSync/repository/syncRepository.js";
import { PrismaProjectionRepository } from "../../modules/offlineSync/projectionEngine/prismaProjectionRepo.js";
import { PrismaLedgerRepo } from "../../modules/offlineSync/repository/PrismaLedgerRepo.js";

export function createBackendLedgerEngine(
  tx: Prisma.TransactionClient
) {
  const repo = new SyncRepository()
  const ledgerRepo = new PrismaLedgerRepo(tx)

  return new LedgerEngine({
    eventStore: new PrismaEventStore(tx, repo),
    snapshotEngine: createSnapshotEngine(tx),
    projectionEngine: CreateProjectionEngine(tx),
    ledgerGenerator: generateLedgerEntries,
    ledgerRepository: ledgerRepo,
    versionManager: new PrismaVersionManager(tx),
  });
}
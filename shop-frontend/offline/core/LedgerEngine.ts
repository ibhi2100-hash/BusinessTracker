import { LedgerEngine } from "@business/ledger-engine";
import { generateLedgerEntries } from "@business/ledger-engine";
import { IndexedDbEventStore } from "@/src/repositories/IndexDbStore";
import { CreateProjectionEngine } from "./events/projectors/projectEngine";
import { IndexedDbVersionManager } from "./events/versionManager";
import { CreateSnapshotEngine } from "./snapshots/registry";
import { IndexedDbProjectionRepository } from "../../src/repositories/indexedDbProjectRepo";
import { AppDB } from "@/src/db";
import { IndexedDbLedgerRepository } from "@/src/repositories/indexedDbLedgerRepo";

export function createFrontendLedgerEngine(
  db: AppDB 
) {
  const repo = new IndexedDbProjectionRepository(db);
  const ledgerRepo = new IndexedDbLedgerRepository(db)

  

  return new LedgerEngine({
    eventStore: new IndexedDbEventStore(),
    snapshotEngine: CreateSnapshotEngine(db),
    projectionEngine: CreateProjectionEngine(db),
    ledgerGenerator: generateLedgerEntries,
    ledgerRepository: ledgerRepo,
    versionManager: new IndexedDbVersionManager(db),
  });
}
import { LedgerEngine } from "@business/ledger-engine";
import { generateLedgerEntries } from "@business/ledger-engine";
import { IndexedDbEventStore } from "@/src/repositories/IndexDbStore";
import { CreateProjectionEngine } from "./events/projectors/projectEngine";
import { IndexedDbVersionManager } from "./events/versionManager";
import { CreateSnapshotEngine } from "./snapshots/registry";
import { IndexedDbProjectionRepository } from "../../src/repositories/indexedDbProjectRepo";
import { AppDB } from "@/src/db";

export function createFrontendLedgerEngine(
  db: AppDB 
) {
  const repo = new IndexedDbProjectionRepository(db);

  

  return new LedgerEngine({
    eventStore: new IndexedDbEventStore(),
    snapshotEngine: CreateSnapshotEngine(db),
    projectionEngine: CreateProjectionEngine(db),
    ledgerGenerator: generateLedgerEntries,
    versionManager: new IndexedDbVersionManager(db),
  });
}
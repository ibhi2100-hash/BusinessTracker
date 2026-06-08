import { LedgerEngine } from "@business/ledger-engine";
import { generateLedgerEntries } from "@business/ledger-engine";
import { IndexedDbEventStore } from "@/src/repositories/IndexDbStore";
import { IndexedDbProjectionEngine } from "./events/projectors/projectEngine";
import { IndexedDbVersionManager } from "./events/versionManager";
import { snapshotEngine } from "./snapshots/registry";

export const ledgerEngine = new LedgerEngine({
  eventStore: new IndexedDbEventStore(),
  snapshotEngine,
  projectionEngine: new IndexedDbProjectionEngine(),
  ledgerGenerator: generateLedgerEntries,
  versionManager: new IndexedDbVersionManager()
});
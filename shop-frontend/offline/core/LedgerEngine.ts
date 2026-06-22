import { LedgerEngine } from "@business/ledger-engine";
import { generateLedgerEntries } from "@business/ledger-engine";
import { AppDB } from "@/src/db";
import { IndexedDbLedgerRepo } from "@/src/repositories/ledgerRepo/ledgerRepo";

export function createFrontendLedgerEngine(
  db: AppDB 
) {

  const ledgerRepo = new IndexedDbLedgerRepo(db)

  

  return new LedgerEngine({
    ledgerGenerator: generateLedgerEntries,
    ledgerRepository: ledgerRepo 
  });
}
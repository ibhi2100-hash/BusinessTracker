import { LedgerEngine } from "@business/ledger-engine";
import { generateLedgerEntries } from "@business/ledger-engine";
import { SQLiteLedgerRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteLedgerRepository/SQLiteLedgerRepository";

export function createFrontendLedgerEngine(
) {

  const ledgerRepo = new SQLiteLedgerRepository()

  

  return new LedgerEngine({
    ledgerGenerator: generateLedgerEntries,
    ledgerRepository: ledgerRepo 
  });
}
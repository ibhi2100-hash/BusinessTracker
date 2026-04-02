import { TABLES } from "../db/schema";
import { generateLedgerEntries } from "../../../shared/ledgerGenerator";
import { BaseEvent } from "../events/eventFactory";


export function financialReducer(tx: IDBTransaction, event: BaseEvent) {
  const ledgerStore = tx.objectStore(TABLES.LEDGER_ENTRIES);

  const entries = generateLedgerEntries(event);

  for (const entry of entries) {
    ledgerStore.add(entry);
  }
}
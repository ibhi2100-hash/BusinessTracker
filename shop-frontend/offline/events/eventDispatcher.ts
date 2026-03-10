import { dbPromise } from "../db/indexDB";
import { createEvent } from "./eventFactory";
import { generateLedgerEntries } from "../ledger/ledgerGenerator";
import { useDashboardStore } from "@/store/DashboardStore";
import { TABLES } from "../db/schema";

export const dispatchEvent = async (type: string, payload: any )=> {
    const db = await dbPromise;

    const event = createEvent(type, payload);

    const ledgerEntries = generateLedgerEntries(event) as any[];

    // save event
    await db.add(TABLES.EVENTS, event);

    // save ledger entries
    const tx = db.transaction(TABLES.LEDGER_ENTRIES, "readwrite");

    for ( const entry of ledgerEntries ) {
        tx.store.add(entry)
    }

    await tx.done

    //update UI instantly
    useDashboardStore
        .getState()
        .applyLedgerEntries(ledgerEntries as any)
}
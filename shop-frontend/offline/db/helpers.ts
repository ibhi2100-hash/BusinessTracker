import { dbPromise } from "./indexDB";
import { TABLES } from "./schema";

const db = await dbPromise

export const addEvent= async(event: any)=> {
    
    await db.add(TABLES.EVENTS, event)
}

export const getPendingEvents = async()=> {
    await db.getAllFromIndex(TABLES.EVENTS, "by_synced", 0)
}

export const addLedgerEntry = async (entry: any)=> {
    await db.add(TABLES.LEDGER_ENTRIES, entry)
}
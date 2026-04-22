
import { db } from '../index';

export const ledgerRepo = {
    addEntries: async (entries: any[]) => {
        return db.table("ledger").bulkAdd(entries);
    },

    existsByEvent: async (eventId: string) => {
        const count = await db
            .table("ledger")
            .where("eventId")
            .equals(eventId)
            .count();

        return count > 0;
    }
};
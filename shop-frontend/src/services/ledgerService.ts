import { AppDB } from "@/src/db";
import { LedgerEntry } from "@/src/domain/ledger";
import { nanoid } from "nanoid";

export const ledgerService = {
  async handleEvent(db: AppDB, event: any) {
    if (event.type === "SALE") {
      const entries: LedgerEntry[] = [
        {
          id: nanoid(),
          eventId: event.id,
          account: "CASH",
          amount: event.payload.total,
          businessId: event.businessId,
          branchId: event.branchId,
          createdAt: Date.now(),
        },
        {
          id: nanoid(),
          eventId: event.id,
          account: "REVENUE",
          amount: -event.payload.total,
          businessId: event.businessId,
          branchId: event.branchId,
          createdAt: Date.now(),
        },
      ];

      await db.ledgerEntries.bulkAdd(entries);
    }
  }
};
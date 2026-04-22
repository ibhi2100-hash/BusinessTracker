import { getDb, runTx } from "@/src/db";
import { EventRepo} from "@/src/repositories/eventRepo/eventRepo";
import { eventBus } from "../eventBus/eventBus";
import { syncEvent } from "@/src/sync/syncEngine";
import { handlers } from "@/offline/core/events/handlers/index"; // 🔥 NEW

export const dispatchEvent = async (event: any) => {
  const db = getDb(event.userId);
  if (!db) return;

  // 🔥 SINGLE TRANSACTION (DEXIE)
  await runTx(
    db,
    [
      db.events,
      db.ledgerEntries,
      db.inventory,
      db.products,
      db.categories,
      db.brands,
      db.businesses,
      db.branches,
      db.assets,
      db.liabilities,
      db.snapshots,
    ],
    async () => {
      // 1. persist event
      await EventRepo

      // 2. run domain handlers (REPLACES REDUCERS)
      for (const handler of handlers) {
        await handler(db, event);
      }
    }
  );

  // 3. emit to UI layer
  eventBus.emit(event);

  // 4. background sync (non-blocking)
  syncEvent().catch(() => {
    console.warn("Sync failed, will retry later");
  });
};
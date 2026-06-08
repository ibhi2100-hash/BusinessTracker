import { getDb, runTx } from "@/src/db";
import { eventBus }from "../eventBus/eventBus";
import { queueSync } from "@/src/sync/syncQueue";
import { validateEvent }from "./validationEngine";
import { BaseEvent } from "@business/shared-types"
import { updateAggregateVersion } from "./aggregate/updateAggregateVersion";
import { ledgerEngine } from "../LedgerEngine";

export const dispatchEvent =
  async (
    event: BaseEvent
    
  ) => {
  

    validateEvent(event);

    const db = getDb(event.userId);
    if (!db) { return;}

    await runTx(db, async () => {

        /* -----------------------------
           IDEMPOTENCY
        ----------------------------- */
        const existing =
          await db.events.get(event.id);
        if (existing) {
          return;
        }
        /* -----------------------------
           APPEND EVENT
        ----------------------------- */
        await db.events.add(event);

        /* -----------------------------
           DETERMINISTIC LEDGER PROJECTION
        ----------------------------- */
        ledgerEngine.process(event)
      },

      db.events,
      db.aggregates,
      db.snapshots,
      db.replicaMeta,
      db.products,
      db.inventory,
      db.businesses,
      db.branches,
      db.users,
      db.ledgerEntries
    );

    /* --------------------------------
       SIDE EFFECTS AFTER COMMIT
    -------------------------------- */
    eventBus.emit(event)
    /* --------------------------------
       QUEUE SYNC
    -------------------------------- */

    queueSync();
};
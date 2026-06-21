import { getDb, runTx } from "@/src/db";
import { eventBus }from "../eventBus/eventBus";
import { queueSync } from "@/src/sync/syncQueue";
import { validateEvent }from "./validationEngine";
import { BaseEvent } from "@business/shared-types"
import { createFrontendLedgerEngine } from "../LedgerEngine";
import { createFrontendEventEngine } from "../eventEngine/createEventEngine";

export const dispatchEvent =
  async (
    event: BaseEvent
    
  ) => {

    validateEvent(event);

    const db = getDb(event.userId);
    if (!db) { return;}

    await runTx(db, async () => {
      const eventEngine = createFrontendEventEngine(db);
      await eventEngine.pipeline.append(event)

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
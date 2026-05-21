import { getDb, runTx } from "@/src/db";

import { eventBus }
  from "../eventBus/eventBus";

import { queueSync }
  from "@/src/sync/syncQueue";

import { validateEvent }
  from "./validationEngine";

import { BaseEvent }
  from "./types";

import {
  handlers
} from "./handler/handlers";

import {
  projectors
} from "./projectors/projectorRegistry";

import {
  updateAggregateVersion
} from "./aggregate/updateAggregateVersion";

import { generateLedgerEntries } from "@business/shared";

export const dispatchEvent =
  async (
    event: BaseEvent
  ) => {

    validateEvent(event);

    const db =
      getDb(event.userId);

    if (!db) {
      return;
    }

    await runTx(

      db,

      async () => {

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
           UPDATE LOCAL AGGREGATE VERSION
        ----------------------------- */

        await updateAggregateVersion(
          db,
          event
        );

        /* -----------------------------
           PROJECT EVENT
        ----------------------------- */

        const eventProjectors =
          projectors[event.type] ?? [];

        for (const projector of eventProjectors) {

          await projector(
            db,
            event
          );
        }

        /* -----------------------------
           DETERMINISTIC LEDGER PROJECTION
        ----------------------------- */

        const entries =
          generateLedgerEntries(event);

        if (entries.length) {

          await db.ledgerEntries.bulkPut(
            entries
          );
        }

        /* -----------------------------
           SNAPSHOT UPDATE
        ----------------------------- */
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

    const effects =
      handlers[
        event.type
      ] ?? [];

    for (const effect of effects) {

      await effect(event);
    }

    /* --------------------------------
       EMIT EVENT BUS
    -------------------------------- */

    eventBus.emit(event);

    /* --------------------------------
       QUEUE SYNC
    -------------------------------- */

    queueSync();
};
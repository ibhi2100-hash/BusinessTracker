import { getDb, runTx } from "@/src/db";
import { eventBus } from "../eventBus/eventBus";
import { generateLedgerEntries } from "../../../../shared/ledgerGenerator";
import { queueSync } from "@/src/sync/syncQueue";
import { handlers } from "@/offline/core/events/handlers/eventHandler";
import { validateEvent } from "./validationEngine";
import { BaseEvent } from "./types";

export const dispatchEvent = async (event: BaseEvent) => {
  validateEvent(event);

  const db = getDb(event.userId);
  if (!db) return;

  await runTx(
    db,
    async () => {
      const aggregate =
        await db.aggregates
          .where("[aggregateType+aggregateId]")
          .equals([
            event.aggregateType,
            event.aggregateId
          ])
          .first();

        const currentVersion =
          aggregate?.version ?? 0;

        await db.aggregates.put({

          id:
            `${event.aggregateType}:${event.aggregateId}`,

          aggregateId:
            event.aggregateId,

          aggregateType:
            event.aggregateType,

          version:
            currentVersion + 1,

          updatedAt:
            Date.now(),
        });
        const exists = await db.events.get(event.id);
        if (exists) return;

        // 1. persist event (PENDING first)
        await db.events.add({
          ...event,
          status: "PENDING",
          synced: false,
        });

      // 2. ledger projection
      const entries = generateLedgerEntries(event);
      if (entries.length) {
        await db.ledgerEntries.bulkAdd(entries);
      }
      // 3. projection handlers
      const eventHandlers = handlers[event.type] || [];
      for (const handler of eventHandlers) {
        await handler(db, event);
      }
    },
    db.events,
    db.aggregates,
    db.replicaMeta,
    db.ledgerEntries,
    db.inventory,
    db.businesses,
    db.branches,
    db.products,
    db.inventory,
    db.snapshots,
    db.assets,
    db.liabilities,
    db.users
  );

  // emit AFTER commit
  eventBus.emit(event);

  // queue sync (safe now)
  queueSync();
};
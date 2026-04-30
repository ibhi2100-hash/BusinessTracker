import { getDb, runTx } from "@/src/db";
import { eventBus } from "../eventBus/eventBus";
import { generateLedgerEntries } from "../../../../shared/ledgerGenerator";
import { syncEvent } from "@/src/sync/syncEngine";
import { handlers } from "@/offline/core/events/handlers/eventHandler"; // 🔥 NEW
import { validateEvent } from "./validationEngine";
import { BaseEvent } from "./types";

export const dispatchEvent = async (event: BaseEvent) => {
  validateEvent(event);

  const db = getDb(event.userId);
  if (!db) return;


 await runTx(db, async () => {

  // 1. persist event
  await db.events.add(event);

  // 2. idempotency guard
  if (await ledgerRepo.existsByEvent(event.id)) return;

  // 3. generate ledger (PURE)
  const entries = generateLedgerEntries(event);

  await db.ledgerEntries.bulkAdd(entries);

  const existing = await db.events.get(event.id)
  if(existing?.status === "synced") return;

  // 4. run handlers (mutations)
  for (const handler of handlers) {
    await handler(db, event);
  }
  await db.events.update(event.id, { status: "synced"})

}, 
db.events, 
db.ledgerEntries, 
db.inventory);

  // 3. emit to UI layer
  eventBus.emit(event);

  // 4. background sync (non-blocking)
  syncEvent().catch(() => {
    console.warn("Sync failed, will retry later");
  });
};
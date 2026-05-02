import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { generateLedgerEntries } from "../../../../shared/ledgerGenerator";
import { handlers } from "../events/handlers/eventHandler";

async function rebuildProjections(branchId) {
  const userId = useAuthStore.getState().user.id

  const db = await getDb(userId)
  await db.inventory.clear();
  await db.products.clear();
  await db.ledgerEntries.clear();

  const events = await db.events
    .where("branchId")
    .equals(branchId)
    .sortBy("version");

  for (const event of events) {
    const entries = generateLedgerEntries(event);
    await db.ledgerEntries.bulkAdd(entries);
      const eventHandlers = handlers[event.type] || [];
      
    for (const handler of eventHandlers) {
      await handler(db, event);
    }
  }
}
import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { generateLedgerEntries } from "@business/shared";
import { projectors } from "../events/projectors/projectorRegistry";

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
      const eventProjectors = projectors[event.type] || [];
      
    for (const projector of eventProjectors) {
      await projector(db, event);
    }
  }
}
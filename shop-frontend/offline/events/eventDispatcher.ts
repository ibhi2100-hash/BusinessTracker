import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";
import { inventoryReducer } from "@/offline/reducer/inventoryReducer";
import { financialReducer } from "@/offline/reducer/financeReducer";
import { syncEvent } from "../sync/syncEngine";

export const dispatchEvent = async (event: any) => {
  console.log("The event just hit the dispatcher: ", event)
  const db = await getDb();

  const tx = db.transaction(
    [
      TABLES.EVENTS,
      TABLES.LEDGER_ENTRIES,
      TABLES.INVENTORY,
      TABLES.PRODUCTS,
      TABLES.CATEGORIES,
      TABLES.BRANDS
    ],
    "readwrite"
  );
  
  // 1. persist event
  await tx.objectStore(TABLES.EVENTS).add(event);
console.log("I just store Event in the indexedDb just check it out: ")
  // 2. run reducers (ALL inside same tx)
  inventoryReducer(tx, event);
  financialReducer(tx, event);

  // 3. commit
  await tx.done;

  // 4. background sync (non-blocking)
  syncEvent().catch(() => {
    console.warn("Sync failed, will retry later");
  });
};
import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";
import { inventoryReducer } from "@/offline/reducer/inventoryReducer";
import { financialReducer } from "@/offline/reducer/financeReducer";
import { syncEvent } from "../sync/syncEngine";
import { BusinessReducer } from "../reducer/businessReducer";

export const dispatchEvent = async (event: any) => {
  const userId = event.userId;
  const db = await getDb(userId);

  const tx = db.transaction(
    [
      TABLES.BUSINESS,
      TABLES.BRANCHES,
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

  // 2. run reducers (ALL inside same tx)
  BusinessReducer(tx, event);
  inventoryReducer(tx, event);
  financialReducer(tx, event);

  // 3. commit
  await tx.done;

  // 4. background sync (non-blocking)
  syncEvent().catch(() => {
    console.warn("Sync failed, will retry later");
  });
};
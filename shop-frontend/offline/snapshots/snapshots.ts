import { TABLES } from "../db/schema";
import { getDb } from "../db/indexDB";



async function createSnapshot(tx: IDBTransaction, event: any) {
  const snapshotStore = tx.objectStore(TABLES.SNAPSHOT);

  const products = await tx.objectStore(TABLES.PRODUCTS).getAll;
  const inventory = await tx.objectStore(TABLES.INVENTORY).getAll();

  await snapshotStore.put({
    id: "main",
    businessId: event.businessId,
    branchId: event.branchId,
    data: {
      products,
      inventory,
    },
    lastEventId: event.id,
    updatedAt: Date.now(),
  });
}

async function replayEvents(fromEventId?: string) {
  const db = await getDb();

  const events = await db.getAllFromIndex(
    TABLES.EVENTS,
    "by_createdAt"
  );

  for (const event of events) {
    await reducers(tx, event);
  }
}
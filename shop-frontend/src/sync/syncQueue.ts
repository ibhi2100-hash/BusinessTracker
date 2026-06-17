import { getDb } from "../db";
import { useAuthStore } from "../store/useAuthStore";
import { createSyncManager } from "../services/sync";

let syncing = false;
let queued = false;

export const queueSync = async () => {
  if (syncing) {
    queued = true;
    return;
  }
  const userId = useAuthStore.getState().user?.id
  if(!userId) return;
  const db  = getDb(userId)
  syncing = true;
  
  const syncManager = createSyncManager(db)
  try {
    await syncManager.sync();
  } finally {
    syncing = false;

    // run again if events came in during sync
    if (queued) {
      queued = false;
      queueSync();
    }
  }
};
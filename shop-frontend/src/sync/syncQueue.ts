import { StorageBusCreator } from "../offline/sqlite/bus/StorageBusCreator";
import { DatabaseTarget } from "../offline/sqlite/protocol/DatabaseTarget";
import { createSyncManager } from "../services/sync";

let syncing = false;
let queued = false;

export const queueSync = async () => {
  if (syncing) {
    queued = true;
    return;
  }

  const storage = StorageBusCreator()
  syncing = true;
  
  const syncManager = createSyncManager()
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
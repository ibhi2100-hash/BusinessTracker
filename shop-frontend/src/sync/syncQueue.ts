import { syncEngine } from "./syncEngine";

let syncing = false;
let queued = false;

export const queueSync = async () => {
  if (syncing) {
    queued = true;
    return;
  }

  syncing = true;

  try {
    await syncEngine();
  } finally {
    syncing = false;

    // run again if events came in during sync
    if (queued) {
      queued = false;
      queueSync();
    }
  }
};
type SyncState = {
  lastSyncedAt: number;

  latestVersion: number;

  pendingEvents: number;

  failedEvents: number;
};
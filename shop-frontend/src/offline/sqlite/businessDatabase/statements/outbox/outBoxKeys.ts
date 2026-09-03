export const OutboxKeys = {
  insert: "insert.outbox",
  getPending: "getPending.outbox",
  markSynced: "markSynced.outbox",
  markConflict: "markConflict.outbox",
  markRejected: "markRejected.outbox",
  scheduleRetry: "scheduleRetry.outbox",
  resetInFlight: "resetInFlight.outbox",
} as const;
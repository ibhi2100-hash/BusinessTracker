import { GET_PENDING_COUNT } from "./sql";

export const OutboxKeys = {
  insert: "insert.outbox",
  getPending: "getPending.outbox",
  markSynced: "markSynced.outbox",
  markConflict: "markConflict.outbox",
  markRejected: "markRejected.outbox",
  scheduleRetry: "scheduleRetry.outbox",
  resetInFlight: "resetInFlight.outbox",
  getPendingCount: "getPendingCount.outbox",
} as const;
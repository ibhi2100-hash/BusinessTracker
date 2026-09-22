export type SyncActivityType =
    | "SYNC_STARTED"
    | "SYNC_COMPLETED"
    | "SYNC_FAILED"

    | "EVENT_UPLOADED"
    | "EVENT_ACCEPTED"
    | "EVENT_REJECTED"
    | "EVENT_ALREADY_ACCEPTED"

    | "EVENT_PULLED"
    | "EVENT_APPLIED"

    | "CONFLICT_DETECTED"
    | "CONFLICT_RESOLVED"

    | "CURSOR_ADVANCED";

export type SyncActivityOutcome =
    | "ACCEPTED"
    | "ALREADY_ACCEPTED"
    | "REJECTED"
    | "CONFLICT";

export type SyncActivitySeverity =
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR";
export interface SyncActivityMetadata {
  aggregateVersion?: number;
  globalPosition?: number;
  [key: string]: unknown;
}

export interface SyncActivity {
  id: number;

  activityId: string;

  type: SyncActivityType;

  status?: SyncActivityOutcome | null;

  syncInfo?: SyncActivitySeverity | null;

  message?: string | null;

  eventId?: string | null;

  aggregateType?: string | null;

  aggregateId?: string | null;

  sequenceNumber?: number | null;

  createdAt: number;

  metadata?: SyncActivityMetadata | null;
}
export type EventScope = "GLOBAL" | "BUSINESS" | "BRANCH";  
export interface Event {
  // EVENT ID
  id: string;

  // STREAM / AGGREGATE
  aggregateId: string;
  aggregateType: string;

  // EVENT INFO
  type: string;
  payload: Record<string, any>;

  // TENANCY
  businessId: string | null;

  branchId?: string | null;

  // OPERATING MODE
  mode: "OPENING" | "LIVE";

  // STREAM VERSIONING
  AggregateVersion: number;
  expectedAggregateVersion: number;

  // DEVICE ORDERING
  logicClock: number;

  // SYNC SCOPE
  scope: string;

  // EVENT ORIGIN
  deviceId: string;
  userId?: string | null;

  // SYNC STATUS
  status: "PENDING" | "SYNCED" | "FAILED" | "DEAD";

  synced: boolean;
  retryCount?: number;
  lastRetryAt?: number;
  nextRetryAt?: number;
  lastError?: string;
  isCreationEvent: boolean;
  causationId?: string;
  correlationId?: string;

  // TIMESTAMPS
  createdAt: Date;
}
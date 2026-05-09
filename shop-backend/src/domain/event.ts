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
  businessId?: string | null;

  branchId?: string | null;

  // OPERATING MODE
  mode: "OPENING" | "LIVE";

  // STREAM VERSIONING
  version: number;

  // DEVICE ORDERING
  logicClock: number;

  // SYNC SCOPE
  scope: EventScope;

  // EVENT ORIGIN
  deviceId: string;
  userId?: string | null;

  // SYNC STATUS
  status: "PENDING" | "SYNCED" | "FAILED";

  synced: boolean;

  // TIMESTAMPS
  createdAt: Date;
}
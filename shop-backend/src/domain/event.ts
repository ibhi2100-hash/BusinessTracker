export type EventScope = "GLOBAL" | "BUSINESS" | "BRANCH";  

export interface Event {
  // EVENT ID
  id: string;

  // STREAM / AGGREGATE
  aggregateId: string;
  aggregateType: string;

  expectedAggregateVersion?: number | null;

  // EVENT INFO
  type: string;
  payload: Record<string, any>;

  // TENANCY
  businessId?: string | null;

  branchId?: string | null;

  // OPERATING MODE
  mode: "OPENING" | "LIVE";


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
  isCreationEvent: boolean;
  causationId?: string;
  correlationId?: string;

  // TIMESTAMPS
  createdAt: Date;
}
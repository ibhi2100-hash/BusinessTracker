import { EventType } from "./eventType";
// eventTypes.ts
export interface BaseEvent<T extends EventType = EventType, p = Record<string, any>> {
  id: string;

  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  expectedAggregateVersion?: number

  type: T;

  payload: p;

  businessId?: string | null;
  branchId?: string  | null;

  mode: "OPENING" | "LIVE";

  scope: "GLOBAL" | "BUSINESS" | "BRANCH";

  // sync + ordering
  createdAt: Date;       // device time
  logicClock: bigint;    // monotonic per device

  // origin
  deviceId: string;
  userId: string | null;

  // sync state
  status: "PENDING" | "SYNCED" | "FAILED" | "DEAD";
  synced: boolean;
  retryCount?: number;
  lastRetryAt?: number;
  nextRetryAt?: number;
  lastError?: string;
  isCreationEvent: boolean;
  causationId?: string;
  correlationId?: string;
}
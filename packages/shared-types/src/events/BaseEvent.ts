import { Scope } from "../enums/Scope";

// eventTypes.ts
export interface BaseEvent<T extends string = string, p = Record<string, any>> {
  id: string;

  aggregateId: string;
  aggregateType: string;
  aggregateVersion?: number;
  expectedAggregateVersion: number;

  type: T;

  payload: p;

  businessId?: string | null;
  branchId?: string  | null;

  mode: "OPENING" | "LIVE";

  scope: Scope;

  // sync + ordering
  createdAt: Date;       // device time
  updatedAt?: Date;     // device time
  logicClock: number;    // monotonic per device
  globalPosition?: bigint

  // origin
  deviceId: string;
  userId: string ;

  // sync state
  syncStatus: "PENDING" | "SYNCED"| "CONFLICT" | "RETRYING" | "FAILED" | "DEAD";
  synced: boolean;
  syncedAt?: number;
  retryCount?: number;
  lastRetryAt?: number;
  nextRetryAt?: number;
  lastError?: string;
  isCreationEvent?: boolean;
  causationId?: string;
  correlationId?: string;

  metadata?: string;
  checksum?: string;
}
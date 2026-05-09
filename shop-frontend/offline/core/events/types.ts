import { EventType } from "./eventType";
// eventTypes.ts
export interface BaseEvent<T extends EventType = EventType, p = Record<string, any>> {
  id: string;

  aggregateId: string;
  aggregateType: string;

  type: T;

  payload: p;

  businessId?: string | null;
  branchId?: string  | null;

  mode: "OPENING" | "LIVE";

  scope: "GLOBAL" | "BUSINESS" | "BRANCH";

  // sync + ordering
  createdAt: number;       // device time
  logicClock: number;    // monotonic per device
  version: number;         // per branch stream

  // origin
  deviceId: string;
  userId: string | null;

  // sync state
  status: "PENDING" | "SYNCED" | "FAILED";
  synced: boolean;
}
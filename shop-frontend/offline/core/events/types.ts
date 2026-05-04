import { EventType } from "./eventType";
// eventTypes.ts
export interface BaseEvent<T extends EventType = EventType, p = any> {
  id: string;

  type: T;
  payload: p;

  businessId: string;
  branchId: string;

  mode: "OPENING" | "LIVE";

  // sync + ordering
  createdAt: number;       // device time
  logicClock: number;    // monotonic per device
  version: number;         // per branch stream

  // origin
  deviceId: string;
  userId: string;

  // sync state
  status: "pending" | "synced" | "failed";
  synced: boolean;
}
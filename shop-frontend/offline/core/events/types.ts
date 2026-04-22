// eventTypes.ts
export type EventStatus = "pending" | "synced" | "failed";

export interface BaseEvent {
  id: string;
  type: string;
  payload: any;

  businessId: string;
  branchId: string;
  userId: string;

  status: EventStatus;

  createdAt: number;
  updatedAt: number;

  version: number;
  synced: boolean;
}
import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent} from "./types";

type CreateEventInput = {
  type: string;
  payload: any;
  mode: "OPENING" |"LIVE"
  businessId: string;
  branchId: string;
  userId: string;
  status?: "pending" | "synced" | "failed"
  deviceId?: string;
};

export function createEvent(input: CreateEventInput): BaseEvent {
  const {
    type,
    payload,
    mode,
    businessId,
    branchId,
    userId,
    status = "pending",
  } = input;

  return createEntity({
    type,
    payload,
    mode,
    businessId,
    branchId,
    userId,
    status,
    logicalClock: 1233,
    deviceId: "local-device",
  });
}
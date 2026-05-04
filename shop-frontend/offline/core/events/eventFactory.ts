import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent} from "./types";
import { getNextLogicClock } from "@/src/utils/logicClock";
import { nanoid } from "nanoid";

type CreateEventInput = {
  type: string;
  payload: any;
  mode: "OPENING" |"LIVE"
  businessId?: string;
  branchId?: string;
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
    id: nanoid(),
    type,
    payload,
    mode,
    businessId,
    branchId,
    userId,
    status,
    version: 0,
    logicClock: getNextLogicClock(),
    deviceId: "local-device",
  });
}
import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent, EventStatus } from "./types";

type CreateEventInput = {
  type: string;
  payload: any;
  businessId: string;
  branchId: string;
  userId: string;
  status?: EventStatus;
};

export function createEvent(input: CreateEventInput): BaseEvent {
  const {
    type,
    payload,
    businessId,
    branchId,
    userId,
    status = "pending",
  } = input;

  return createEntity({
    type,
    payload,
    businessId,
    branchId,
    userId,
    status,
    deviceId: getDeviceId(),
  });
}
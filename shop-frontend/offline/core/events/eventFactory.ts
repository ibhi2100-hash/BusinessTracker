import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent } from "./types";
import { getNextLogicClock } from "@/src/utils/logicClock";
import { nanoid } from "nanoid";
import { getNextAggregateVersion } from "../../../src/helpers/aggregateHelper";

type CreateEventInput = {
  type: string;

  aggregateId: string;
  aggregateType: string;

  payload: Record<string, any>;

  mode: "OPENING" | "LIVE";

  businessId?: string | null;
  branchId?: string | null;

  userId: string;

  scope?: "GLOBAL" | "BUSINESS" | "BRANCH";

  status?: "PENDING" | "SYNCED" | "FAILED";

  deviceId?: string;
};

export async function createEvent(
  input: CreateEventInput
): Promise<BaseEvent> {
  const {
    type,
    aggregateId,
    aggregateType,
    payload,
    mode,
    businessId,
    branchId,
    userId,
    status = "PENDING",
    scope = "BUSINESS",
  } = input;

  const version = await getNextAggregateVersion(
    userId,
    aggregateType,
    aggregateId
  );

  return createEntity({
    id: nanoid(),

    aggregateId,
    aggregateType,

    type,

    payload,

    mode,

    businessId,
    branchId,

    userId,

    status,

    scope,

    version,

    logicClock: getNextLogicClock(),

    deviceId: "local-device",

    synced: false,

    createdAt: new Date(),
  });
}
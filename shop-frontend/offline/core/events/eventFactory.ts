import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent } from "./types";
import { getDeviceId } from "@/src/utils/deviceIdGenerator";
import { nextLogicClock } from "@/src/utils/nextLogicClock";
import { AppDB } from "@/src/db";

type CreateEventInput = {
  type: string;

  aggregateType: string;
  aggregateId: string;
  expectedAggregateVersion?: number;

  payload: Record<string, any>;

  mode: "OPENING" | "LIVE";

  businessId?: string | null;
  branchId?: string | null;

  userId: string;

  scope?: "GLOBAL" | "BUSINESS" | "BRANCH";

  status?: "PENDING" | "SYNCED" | "FAILED";
  isCreationEvent?: boolean;

};

export async function createEvent(
  db: AppDB,
  input: CreateEventInput
): Promise<BaseEvent> {
 const deviceId = await getDeviceId();

 const aggregate = await db.aggregates
  .where("[aggregateType+aggregateId]")
  .equals([input.aggregateType, input.aggregateId])
  .first();

const currentVersion = aggregate?.version ?? 0;
const logicClock = await nextLogicClock(db, deviceId);

  return createEntity({
    aggregateId: input.aggregateId,
    aggregateType: input.aggregateType,
    expectedAggregateVersion: currentVersion,
    isCreationEvent: !aggregate,

    type: input.type,
    payload: input.payload,

    mode: input.mode,
    businessId: input.businessId ?? null,
    branchId: input.branchId ?? null,

    scope: input.scope,
    logicClock,
    deviceId,
    userId: input.userId,
    status: input.status ?? "PENDING",
  })
}
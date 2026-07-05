import { createEntity } from "@/offline/core/entities/entityFactory";
import { BaseEvent } from "@business/shared-types";
import { getDeviceId } from "@/src/utils/deviceIdGenerator";
import { nextLogicClock } from "@/src/utils/nextLogicClock";
import { StorageClient } from "@/src/offline/sqlite/bus/StorageBus"
import { AggregateState } from "@business/sync";


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
  input: CreateEventInput
): Promise<BaseEvent> {

    const deviceId = await getDeviceId();

    const db = new StorageClient();

    const rows = await db.query<AggregateState>(`
        SELECT version
        FROM aggregates
        WHERE aggregateId = ?
        AND aggregateType = ?
        LIMIT 1
    `, [
        input.aggregateId,
        input.aggregateType
    ]);

    const aggregate = rows[0];

    const expectedAggregateVersion =
        aggregate?.version ?? 0;

    const logicClock =
        await nextLogicClock(db, deviceId);

    return createEntity({

        aggregateId: input.aggregateId,
        aggregateType: input.aggregateType,

        expectedAggregateVersion,

        isCreationEvent: !aggregate,

        type: input.type,

        payload: input.payload,

        mode: input.mode,

        businessId: input.businessId ?? null,

        branchId: input.branchId ?? null,

        userId: input.userId,

        scope: input.scope,

        deviceId,

        logicClock,

        syncStatus: "PENDING"

    });

}
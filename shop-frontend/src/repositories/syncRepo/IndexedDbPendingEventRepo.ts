import { AppDB } from "@/src/db";
import {
    AggregateState,
    SyncRepository,
    SyncConflict,
    ConflictResolution
} from "@business/sync";


import { BaseEvent } from "@business/shared-types";

export class LocalSyncRepository
    implements SyncRepository {

    constructor(
        private readonly db: AppDB
    ) {}

    async getEvent(
        eventId: string
    ): Promise<BaseEvent | null> {

        return (
            await this.db.events.get(eventId)
        ) ?? null;

    }
    async getPendingEvents(): Promise<BaseEvent[]> {

        return this.db.events
            .where("status")
            .equals("PENDING")
            .sortBy("logicClock");

    }
    async getRetryableEvents(
        now: number
    ): Promise<BaseEvent[]> {

        return this.db.events
            .where("[nextRetryAt+status]")
            .between(
                [0, "RETRYING"],
                [now, "RETRYING"]
            )
            .toArray();

    }

    async getSyncedEvents(
    aggregateId: string,
    aggregateType: string
): Promise<BaseEvent[]> {

    return this.db.events
        .where("[aggregateType+aggregateId]")
        .equals([
            aggregateType,
            aggregateId
        ])
        .filter(e =>
            e.status === "SYNCED"
        )
        .sortBy("aggregateVersion");

    }
    async getAggregateState(
    aggregateId: string,
    aggregateType: string
): Promise<AggregateState> {

    const record =
        await this.db.aggregates
            .where("[aggregateType+aggregateId]")
            .equals([
                aggregateType,
                aggregateId
            ])
            .first();

    if (!record) {

        return {
            
            id: `${aggregateType}-${aggregateId}`,
            aggregateId,
            aggregateType,
            version: 0,
            lastEventId: undefined,
            lastGlobalPosition: BigInt(0),
            updatedAt: new Date()

        };

    }

        return record;

    }
    async markSyncing(
    eventId: string
): Promise<void> {

    await this.db.events.update(

        eventId,

        {

            status: "SYNCING"

        }

    );

}

    async markSyncingBatch(
    eventIds: string[]
): Promise<void> {

    await this.db.transaction(

        "rw",

        this.db.events,

        async () => {

            for (const id of eventIds) {

                await this.db.events.update(id, {

                    status: "SYNCING"

                });

            }

        }

    );

}
   async markSynced(

    eventId: string,

    aggregateVersion: number,

    globalPosition?: bigint

): Promise<void> {

    await this.db.events.update(

        eventId,

        {

            status: "SYNCED",

            synced: true,

            aggregateVersion,

            globalPosition,

            nextRetryAt: undefined,

            retryCount: 0,

            lastError: undefined

        }

    );

}

    async markFailed(

        eventId: string,

        error: string,

        retryCount: number,

        nextRetryAt?: number

    ): Promise<void> {

        await this.db.events.update(

            eventId,

            {

                status: "RETRYING",

                retryCount,

                nextRetryAt,

                lastError: error

            }

        );

    }
    async markDead(

        eventId: string,

        error: string

    ): Promise<void> {

        await this.db.events.update(

            eventId,

            {

                status: "FAILED",

                lastError: error

            }

        );

    }

    async resetForRetry(
        eventId: string
    ): Promise<void> {

        await this.db.events.update(

            eventId,

            {

                status: "PENDING",

                nextRetryAt: undefined,

                lastError: undefined

            }

        );

    }

    async saveAggregateState(
        state: AggregateState
        ): Promise<AggregateState> {

            await this.db.aggregates.put(state);

            return state;

        }

    async saveConflict(

    conflict: SyncConflict,

    resolution: ConflictResolution

    ): Promise<void> {

    await this.db.conflicts.put({

        id: crypto.randomUUID(),

        aggregateId: conflict.aggregateId,

        aggregateType: conflict.aggregateType,

        conflict,

        resolution,

        createdAt: Date.now()

    });

}

    async markConflict(
        eventId: string,
        reason: string
    ): Promise<void> {

        await this.db.events.update(eventId, {

            status: "CONFLICT",

            lastError: reason,

            nextRetryAt: undefined

        });

    }
}
import {
    BaseEvent,
    CanonicalEvent
} from "@business/shared-types";

import { EventRepository } from "@business/events";

import { VersionManager } from "@business/events";

export class BackendVersionManager
implements VersionManager<BaseEvent, CanonicalEvent> {

    constructor(
        private readonly repository:
            EventRepository<CanonicalEvent>
    ) {}

    async prepare(
        events: readonly BaseEvent[]
    ): Promise<CanonicalEvent[]> {

        if (events.length === 0)
            return [];

        const aggregateId =
            events[0].aggregateId;

        const expectedVersion =
            events[0].expectedAggregateVersion;

        for (const event of events) {

            if (event.aggregateId !== aggregateId) {
                throw new Error(
                    "Events from multiple aggregates cannot be processed together."
                );
            }

            if (
                event.expectedAggregateVersion !==
                expectedVersion
            ) {
                throw new Error(
                    "Batch contains inconsistent expected aggregate versions."
                );
            }

        }

        const currentVersion =
            await this.repository.getCurrentVersion(
                aggregateId
            );

        if (currentVersion !== expectedVersion) {

            throw new Error(
                `VERSION_CONFLICT expected ${expectedVersion} actual ${currentVersion}`
            );

        }

        let version = currentVersion;

        return events.map(event => ({
            id: event.id,

            aggregateId: event.aggregateId,

            aggregateType: event.aggregateType,

            aggregateVersion: ++version,

            type: event.type,

            payload: event.payload,

            mode: event.mode,

            businessId: event.businessId,

            branchId: event.branchId,

            createdAt: event.createdAt,

            userId: event.userId,

            causationId:
                event.causationId ?? null,

            correlationId:
                event.correlationId ?? null
        }));

    }

}
import { AggregateVersionProvider } from "@business/events";

import { EventRepository } from "@business/events";

import { CanonicalEvent } from "@business/shared-types";

export class IndexedDbAggregateVersionProvider
implements AggregateVersionProvider {

    constructor(
        private readonly repository:
            EventRepository<CanonicalEvent>
    ) {}

    async getVersion(
        aggregateId: string
    ): Promise<number> {

        const events =
            await this.repository.loadAggregate(
                aggregateId
            );

        if (events.length === 0)
            return 0;

        return events[events.length - 1]
            .aggregateVersion;
    }

}
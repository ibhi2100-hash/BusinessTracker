import { BaseEvent } from "@business/shared-types";

export interface EventRepository<TEvent> {
    append(event: TEvent): Promise<void>;

    appendMany(events: TEvent[]): Promise<void>

    loadAggregate(
        aggregateId: string
    ): Promise<TEvent[]>;

    loadSince(
        globalPosition: bigint
    ): Promise<TEvent[]>

    loadByIds(
        ids:  string
    ): Promise<TEvent>[];

    exists(
        eventId: string
    ): Promise<boolean>;
}
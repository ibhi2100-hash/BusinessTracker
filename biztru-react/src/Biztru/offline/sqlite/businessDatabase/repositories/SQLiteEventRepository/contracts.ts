import type{ BackendEvent, DomainEvent } from "@business/shared-types";

export interface EventRepository {

    append(
        events: readonly DomainEvent[]
    ): Promise<void>;

    applyRemoteEvents(
        events: BackendEvent[]
    ): Promise<void>;
}
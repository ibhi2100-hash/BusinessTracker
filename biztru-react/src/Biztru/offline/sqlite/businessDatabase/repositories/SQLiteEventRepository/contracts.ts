import type{ DomainEvent } from "@business/shared-types";
import type{ BackendAcceptedEvent } from "@business/shared-types";
export interface EventRepository {

    append(
        events: readonly DomainEvent[]
    ): Promise<void>;

    applyRemoteEvents(
        events: BackendAcceptedEvent[]
    ): Promise<void>;
}
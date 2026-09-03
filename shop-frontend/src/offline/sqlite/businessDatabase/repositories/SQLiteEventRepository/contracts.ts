import { DomainEvent } from "@business/shared-types";
import { BackendAcceptedEvent } from "../../sync/types";
export interface EventRepository {

    append(
        events: readonly DomainEvent[]
    ): Promise<void>;

    applyRemoteEvents(
        events: BackendAcceptedEvent[]
    ): Promise<void>;
}
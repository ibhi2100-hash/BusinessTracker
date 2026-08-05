import { DomainEvent } from "@business/shared-types";
export interface EventRepository {

    append(
        events: readonly DomainEvent[]
    ): Promise<void>;

}
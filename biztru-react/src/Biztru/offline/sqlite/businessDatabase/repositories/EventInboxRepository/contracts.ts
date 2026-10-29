
import type { BackendEvent } from "@business/shared-types";

export interface EventInboxRepository {
    stage(events: readonly BackendEvent[]): Promise<void>;

    loadPending(limit?: number): Promise<BackendEvent[]>;

    remove(eventId: string): Promise<void>;

    recordFailure(
        eventId: string,
        error: string
    ): Promise<void>;

    exists(eventId: string): Promise<boolean>;

    count(): Promise<number>;
}

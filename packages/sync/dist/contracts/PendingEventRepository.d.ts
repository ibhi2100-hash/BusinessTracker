import { BaseEvent } from "@business/shared-types";
import { PendingEvent } from "../types/PendingEvent";
export interface PendingEventRepository {
    /**
     * Stores a newly created event in the pending queue.
     */
    enqueue(event: BaseEvent): Promise<void>;
    /**
     * Returns every pending event.
     */
    getAll(): Promise<PendingEvent[]>;
    /**
     * Returns all pending events belonging
     * to a single aggregate.
     */
    getByAggregate(aggregateId: string, aggregateType: string): Promise<PendingEvent[]>;
    /**
     * Updates a pending event.
     */
    update(event: PendingEvent): Promise<void>;
    /**
     * Removes a pending event after
     * successful synchronization.
     */
    remove(eventId: string): Promise<void>;
    /**
     * Removes multiple events.
     */
    removeMany(eventIds: string[]): Promise<void>;
    /**
     * Returns every event that should
     * be retried now.
     */
    getRetryable(now: Date): Promise<PendingEvent[]>;
    /**
     * Returns all events currently
     * waiting for manual conflict resolution.
     */
    getConflicted(): Promise<PendingEvent[]>;
    /**
     * Clears the queue.
     */
    clear(): Promise<void>;
}

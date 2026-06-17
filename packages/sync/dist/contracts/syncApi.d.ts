import { BaseEvent } from "@business/shared-types";
import { SyncResult } from "../types/SyncResult";
import { AggregateState } from "../types/AggregateState";
export interface SyncApi {
    /**
     * Synchronize a batch of events
     * belonging to one aggregate.
     */
    syncAggregate(aggregateId: string, aggregateType: string, baseVersion: number, events: BaseEvent[]): Promise<SyncResult>;
    /**
     * Returns the latest server state
     * for an aggregate.
     *
     * Used during conflict resolution.
     */
    getAggregateState(aggregateId: string, aggregateType: string): Promise<AggregateState | null>;
    /**
     * Downloads events that occurred
     * after the supplied global position.
     *
     * Used for rebuilding projections
     * and replaying server history.
     */
    getEventsSince(globalPosition: bigint): Promise<BaseEvent[]>;
}

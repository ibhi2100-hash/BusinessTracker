import { BaseEvent } from "@business/shared-types";
import { AggregateState } from "../types/AggregateState";
export interface SyncRepository {
    getEvent(eventId: string): Promise<BaseEvent | null>;
    getPendingEvents(): Promise<BaseEvent[]>;
    getRetryableEvents(now: number): Promise<BaseEvent[]>;
    getSyncedEvents(aggregateId: string, aggregateType: string): Promise<BaseEvent[]>;
    markSyncing(eventId: string): Promise<void>;
    markSynced(eventId: string, aggregateVersion: number, globalPosition?: bigint): Promise<void>;
    markFailed(eventId: string, error: string, retryCount: number, nextRetryAt?: number): Promise<void>;
    markDead(eventId: string, error: string): Promise<void>;
    resetForRetry(eventId: string): Promise<void>;
    saveAggregateState(state: AggregateState): Promise<void>;
    getAggregateState(aggregateId: string, aggregateType: string): Promise<AggregateState | null>;
}

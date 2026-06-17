import { BaseEvent } from "@business/shared-types";
import { AggregateState } from "../types/AggregateState";
import { SyncConflict } from "../types/SyncConflict";
import { ConflictResolution } from "./ConflictResolution";
export interface SyncRepository {
    getEvent(eventId: string): Promise<BaseEvent | null>;
    getPendingEvents(): Promise<BaseEvent[]>;
    getRetryableEvents(now: number): Promise<BaseEvent[]>;
    getSyncedEvents(aggregateId: string, aggregateType: string): Promise<BaseEvent[]>;
    getAggregateState(aggregateId: string, aggregateType: string): Promise<AggregateState>;
    markSyncing(eventId: string): Promise<void>;
    saveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<void>;
    saveAggregateState(state: any): Promise<AggregateState>;
    markSynced(eventId: string, aggregateVersion: number, globalPosition?: bigint): Promise<void>;
    markFailed(eventId: string, error: string, retryCount: number, nextRetryAt?: number): Promise<void>;
    markDead(eventId: string, error: string): Promise<void>;
    resetForRetry(eventId: string): Promise<void>;
    markSyncingBatch(eventIds: string[]): Promise<void>;
    markConflict(eventId: string, reason: string): Promise<void>;
}

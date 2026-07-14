import { StoredEvent } from "./StoredEvent";
export interface OutboxEntry {
    readonly id: string;
    readonly eventId: string;
    readonly payload: StoredEvent;
    status: OutboxStatus;
    retry: RetryPolicy;
}
export declare enum OutboxStatus {
    PENDING = 0,
    PROCESSING = 1,
    RETRYING = 2,
    FAILED = 3,
    DEAD = 4,
    SYNCED = 5
}
export interface RetryPolicy {
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    lastRetryAt?: Date;
    lastError?: string;
}

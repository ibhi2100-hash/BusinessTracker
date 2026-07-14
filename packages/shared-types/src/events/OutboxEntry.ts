import { StoredEvent } from "./StoredEvent";

export interface OutboxEntry {

    readonly id: string;

    readonly eventId: string;

    readonly payload: StoredEvent;

    status: OutboxStatus;

    retry: RetryPolicy;

}
export enum OutboxStatus {

    PENDING,

    PROCESSING,

    RETRYING,

    FAILED,

    DEAD,

    SYNCED

}

export interface RetryPolicy {

    retryCount: number;

    maxRetries: number;

    nextRetryAt?: Date;

    lastRetryAt?: Date;

    lastError?: string;

}
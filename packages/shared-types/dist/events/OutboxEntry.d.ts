export interface OutboxEntry {
    readonly id: string;
    readonly eventId: string;
    readonly retryCount: number;
    readonly maxAttempts: number;
    readonly nextRetryAt: number;
    readonly lockedUntil: number;
    readonly lastError: string;
    readonly createdAt: number;
    readonly syncedAt: number;
    status: OutboxStatus;
}
export declare enum OutboxStatus {
    PENDING = 0,
    PROCESSING = 1,
    RETRYING = 2,
    FAILED = 3,
    DEAD = 4,
    SYNCED = 5
}

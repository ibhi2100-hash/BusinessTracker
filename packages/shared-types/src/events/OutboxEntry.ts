
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
export enum OutboxStatus {

    PENDING,

    PROCESSING,

    RETRYING,

    FAILED,

    DEAD,

    SYNCED

}

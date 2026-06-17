import { BaseEvent } from "@business/shared-types";
export declare enum PendingEventStatus {
    PENDING = "PENDING",
    RETRYING = "RETRYING",
    CONFLICT = "CONFLICT",
    FAILED = "FAILED"
}
export interface PendingEvent {
    event: BaseEvent;
    status: PendingEventStatus;
    retryCount: number;
    nextRetryAt?: Date;
    lastError?: string;
    queuedAt: Date;
    updatedAt: Date;
}

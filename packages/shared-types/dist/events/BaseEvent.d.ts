import { Scope } from "../enums/Scope";
export interface BaseEvent<T extends string = string, p = Record<string, any>> {
    id: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion?: number;
    expectedAggregateVersion?: number;
    type: T;
    payload: p;
    businessId?: string | null;
    branchId?: string | null;
    mode: "OPENING" | "LIVE";
    scope: Scope;
    createdAt: Date;
    updatedAt?: Date;
    logicClock: number;
    globalPosition?: bigint;
    deviceId: string;
    userId: string | null;
    status: "PENDING" | "SYNCED" | "FAILED" | "DEAD";
    synced: boolean;
    retryCount?: number;
    lastRetryAt?: number;
    nextRetryAt?: number;
    lastError?: string;
    isCreationEvent: boolean;
    causationId?: string;
    correlationId?: string;
}

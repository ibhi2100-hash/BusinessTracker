import { DomainEvent } from "../events/DomainEvents";
import { SyncActivity } from "./Activities";
import { Conflict } from "./Conflicts";
export type SyncStatus = "IDLE" | "SYNCED" | "PENDING" | "SYNCING" | "CONFLICT" | "ERROR";
export type NetworkStatus = "OFFLINE" | "ONLINE";
export interface SyncState {
    id: 1;
    status: SyncStatus;
    pendingEvents: number;
    uploadedEvents: number;
    alreadyAcceptedEvents: number;
    pulledEvents: number;
    acceptedEvents: number;
    rejectedEvents: number;
    conflictEvents: number;
    deviceCursor: number;
    lastPulledGlobalPosition: number;
    lastSyncAt: number | null;
    lastSyncDurationMs: number | null;
    lastResult: string | null;
    error: string | null;
    updatedAt: number;
}
export interface PersistedSyncState {
    status: SyncStatus;
    pendingEvents: number;
    uploadedEvents: number;
    alreadyAcceptedEvents: number;
    pulledEvents: number;
    acceptedEvents: number;
    rejectedEvents: number;
    conflictEvents: number;
    deviceCursor: number;
    lastPulledGlobalPosition: number;
    lastSyncAt: number | null;
    lastSyncDurationMs: number | null;
    lastResult: SyncResult | null;
    error: string | null;
    activities: SyncActivity[];
    conflicts: Conflict[];
}
export interface BackendEventPayload<TPayload = any> {
    id: string;
    businessId?: string | null;
    branchId?: string | null;
    aggregateId: string;
    aggregateType: string;
    /**
     * The aggregate version the client believes this event
     * should be appended after.
     */
    expectedAggregateVersion: number;
    type: string;
    mode: "OPENING" | "LIVE";
    payload: Readonly<TPayload>;
    actor: {
        userId: string;
        deviceId: string;
        sessionId?: string;
    };
    causationId: string;
    correlationId: string;
    logicClock: number;
    createdAt: number;
    checksum?: string;
}
export interface SyncSummary {
    accepted: number;
    alreadyAccepted: number;
    conflicts: number;
    rejected: number;
    total: number;
}
/**
 * Canonical event returned by the backend after acceptance.
 *
 * This is the server-authoritative representation of the event.
 */
export interface BackendAcceptedEvent {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    globalPosition: number;
    status: "ACCEPTED" | "ALREADY_ACCEPTED";
}
/**
 * Explicit rejection returned by the backend.
 */
export interface SyncRejectedEvent {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    reason: string;
    message: string;
    expectedAggregateVersion?: number;
    aggregateVersion?: number;
}
export interface SyncRejected {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    status: "REJECTED";
    reason: string;
}
/**
 * Result of pushing local events.
 */
export interface SyncPushResult {
    accepted: BackendAcceptedEvent[];
    conflicts: Conflict[];
    rejected: SyncRejected[];
    summary: SyncSummary;
}
/**
 * Result of pulling events from the global event stream.
 */
export interface SyncPullResult {
    events: BackendAcceptedEvent[];
    /**
     * Cursor after the returned events.
     */
    cursor: number;
    hasMore: boolean;
}
/**
 * Complete synchronization response.
 *
 * One sync cycle can both:
 *
 * 1. push local events
 * 2. pull remote events
 */
export interface SyncBatchResult {
    pushed: SyncPushResult;
    pulled: BackendAcceptedEvent[];
    cursor: number;
    hasMore: boolean;
}
/**
 * HTTP request body for push.
 */
export interface PushEventsRequest {
    events: BackendEventPayload[];
}
export interface SyncTransport {
    push(events: BackendEventPayload[]): Promise<SyncPushResult>;
    pull(cursor: number, limit: number): Promise<SyncPullResult>;
}
/**
 * Maps a domain event into the wire format expected by the backend.
 */
export declare class SyncEventMapper {
    static toBackendPayload<T>(event: DomainEvent<T>): BackendEventPayload<T>;
}
export interface SyncRunResult {
    trigger: SyncTrigger;
    cycles: SyncResult[];
    startedAt: number;
    completedAt: number;
    finalCursor: number;
}
export interface SyncStateRepository {
    getCursor(): Promise<number>;
    setCursor(cursor: number): Promise<void>;
}
export interface LocalEventStore {
}
export interface SyncEngineOptions {
    /**
     * How long a locked outbox item remains claimed.
     */
    lockDurationMs?: number;
    /**
     * Base retry delay.
     */
    baseBackoffMs?: number;
    /**
     * Maximum number of local events pushed per request.
     */
    pushBatchSize?: number;
    /**
     * Maximum number of remote events pulled per request.
     */
    pullBatchSize?: number;
}
export type SyncResult = {
    kind: "idle";
    pushed: number;
    accepted: BackendAcceptedEvent[];
    rejected: SyncRejected[];
    pulled: number;
    cursor: number;
} | {
    kind: "synced";
    pushed: number;
    accepted: BackendAcceptedEvent[];
    rejected: SyncRejected[];
    pulled: number;
    cursor: number;
    hasMore: boolean;
} | {
    kind: "conflict";
    accepted: BackendAcceptedEvent[];
    rejected: SyncRejected[];
    conflicts: Conflict[];
    pushed: number;
    pulled: number;
    cursor: number;
    hasMore: boolean;
} | {
    kind: "rejected";
    accepted: BackendAcceptedEvent[];
    rejected: SyncRejected[];
    pushed: number;
    pulled: number;
    cursor: number;
    hasMore: boolean;
} | {
    kind: "transient";
    error: string;
    attempted: number;
    cursor: number;
};
export type SyncTrigger = "NETWORK" | "INTERVAL" | "MANUAL" | "STARTUP";
export interface SyncCoordinatorEvent {
    trigger: SyncTrigger;
    result: SyncResult;
    startedAt: number;
    completedAt: number;
}
export type SyncCoordinatorResult = {
    kind: "completed";
    result: SyncResult;
} | {
    kind: "already-running";
};
export interface SyncCoordinatorListener {
    onSyncStarted(trigger: SyncTrigger): void;
    onSyncCompleted(event: SyncCoordinatorEvent): void;
    onSyncFailed(error: Error): void;
}
export interface SyncManagementViewModel {
    status: SyncStatus;
    pendingEvents: number;
    lastSyncAt: number | null;
    lastSyncDurationMs: number | null;
    error: string | null;
    activities: SyncActivity[];
    conflicts: Conflict[];
    online: boolean;
}

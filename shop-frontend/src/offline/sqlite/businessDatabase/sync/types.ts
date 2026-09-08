import { DomainEvent } from "@business/shared-types";
import { SyncTrigger } from "./SyncCoordinator/SyncCoordinator";
import { SyncResult } from "./syncEngine";

/**
 * Event sent from the local client to the backend.
 *
 * This is intentionally different from BackendAcceptedEvent.
 * The client does not know:
 * - aggregateVersion after commit
 * - globalPosition
 *
 * Those are assigned/confirmed by the backend.
 */
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
    status: "ACCEPTED";
}


/**
 * Explicit rejection returned by the backend.
 */
export interface SyncRejectedEvent {

    eventId: string;

    aggregateId: string;

    aggregateType: string;

    reason:
        | "CONFLICT"
        | "VALIDATION"
        | "DUPLICATE"
        | "UNAUTHORIZED"
        | "INVALID";

    message: string;

    expectedVersion?: number;

    actualVersion?: number;
}

export interface SyncConflict {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    expectedAggregateVersion: number;
    serverAggregateVersion: number;
    serverEvents: any[];
    status: "CONFLICT";
}

export interface SyncRejected {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    status: "REJECTED";
    reason: string

}


/**
 * Result of pushing local events.
 */
export interface SyncPushResult {

    accepted: BackendAcceptedEvent[];

    conflicts: SyncConflict[];

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

    pull(
        cursor: number,
        limit: number
    ): Promise<SyncPullResult>
}

/**
 * Maps a domain event into the wire format expected by the backend.
 */
export class SyncEventMapper {

    static toBackendPayload<T>(
        event: DomainEvent<T>
    ): BackendEventPayload<T> {

        return {
            id: event.id,

            aggregateId:
                event.aggregateId,

            aggregateType:
                event.aggregateType,

            expectedAggregateVersion:
                event.expectedAggregateVersion,

            type:
                event.type,

            mode:
                event.mode,

            payload:
                event.payload,

            actor:
                event.actor,

            causationId:
                event.causationId,

            correlationId: 
                event.correlationId,

            logicClock:
                event.logicClock,

            createdAt:
                event.createdAt,

            checksum:
                event.checksum,
        };
    }
}

export interface SyncRunResult {
    trigger: SyncTrigger;

    cycles: SyncResult[];

    startedAt: number;

    completedAt: number;

    finalCursor: number;
}

import {
    BackendAcceptedEvent,
    BackendEventPayload,
    SyncPushResult,
    SyncPullResult,
    SyncRejectedEvent,
    SyncTransport,
} from "./types";

import {
    OutboxRow,
    PendingOutboxEvent,
    SQLiteOutboxRepository,
} from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";
import { SQLiteEventRepository } from "../repositories/SQLiteEventRepository/eventStore";
import { DomainEvent } from "@business/shared-types";



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


export type SyncResult =
    | {
        kind: "idle";

        pushed: number;
        pulled: number;

        cursor: number;
    }

    | {
        kind: "synced";

        pushed: number;
        rejected: number;

        pulled: number;

        cursor: number;
        hasMore: boolean;
    }

    | {
        kind: "conflict";

        accepted: BackendAcceptedEvent[];

        rejected: SyncRejectedEvent[];

        conflicts: SyncRejectedEvent[];

        pulled: number;

        cursor: number;

        hasMore: boolean;
    }

    | {
        kind: "rejected";

        accepted: BackendAcceptedEvent[];

        rejected: SyncRejectedEvent[];

        pulled: number;

        cursor: number;

        hasMore: boolean;
    }

    | {
        kind: "transient";

        error: string;

        attempted: number;

        cursor: number;
    };


export class SyncEngine {

    private readonly lockDurationMs: number;

    private readonly baseBackoffMs: number;

    private readonly pushBatchSize: number;

    private readonly pullBatchSize: number;


    constructor(
        private readonly outbox:
            SQLiteOutboxRepository,

        private readonly transport:
            SyncTransport,

        private readonly syncState:
            SyncStateRepository,

        private readonly eventStore:
            SQLiteEventRepository,

        options: SyncEngineOptions = {}
    ) {

        this.lockDurationMs =
            options.lockDurationMs ??
            30_000;

        this.baseBackoffMs =
            options.baseBackoffMs ??
            1_000;

        this.pushBatchSize =
            options.pushBatchSize ??
            50;

        this.pullBatchSize =
            options.pullBatchSize ??
            100;
    }


    /**
     * Executes one complete synchronization cycle.
     *
     * Order:
     *
     * 1. Recover stale outbox locks
     * 2. Push pending local events
     * 3. Apply push acknowledgements
     * 4. Pull remote events
     * 5. Apply remote events locally
     * 6. Advance cursor
     */
    async sync(): Promise<SyncResult> {

        const now =
            Date.now();

        /*
         * -------------------------------------------------------
         * 1. Recover stale locks
         * -------------------------------------------------------
         */

        await this.outbox.resetStaleInFlight(now);


        /*
         * -------------------------------------------------------
         * 2. Read current cursor
         * -------------------------------------------------------
         */

        let cursor =
            await this.syncState.getCursor();


        /*
         * -------------------------------------------------------
         * 3. Push local events
         * -------------------------------------------------------
         */

        const pending =
            await this.outbox.getPending(
                now,
                this.pushBatchSize
            );


        let pushedAccepted:
            BackendAcceptedEvent[] = [];

        let pushedRejected:
            SyncRejectedEvent[] = [];


        if (pending.length > 0) {

            const lockUntil =
                now +
                this.lockDurationMs;

            const outboxIds =
                pending.map(
                    item => item.outboxId
                );

            await this.outbox.lockBatch(
                outboxIds,
                lockUntil,
                now
            );


            const payloads:
                BackendEventPayload[] =
                pending.map(
                    item =>
                        this.toBackendPayload(item.event)
                );


            let pushResult:
                SyncPushResult;


            try {

                pushResult =
                    await this.transport.push(
                        payloads
                    );

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                await this.scheduleRetries(
                    pending,
                    message,
                    now
                );

                return {
                    kind: "transient",
                    error: message,
                    attempted: pending.length,
                    cursor,
                };
            }


            pushedAccepted =
                pushResult.accepted;

            pushedRejected =
                pushResult.rejected;


            /*
             * ---------------------------------------------------
             * 4. Apply accepted events to outbox
             * ---------------------------------------------------
             */

            for (
                const accepted
                of pushResult.accepted
            ) {

                const row =
                    pending.find(
                        r =>
                            r.event.id ===
                            accepted.id
                    );

                if (!row) {
                    continue;
                }


                await this.outbox.markSynced(

                    row.outboxId,

                    now,

                    accepted.globalPosition,

                    accepted.aggregateVersion,

                    accepted.createdAt
                );
            }


            /*
             * ---------------------------------------------------
             * 5. Apply rejected events
             * ---------------------------------------------------
             */

            for (
                const rejected
                of pushResult.rejected
            ) {

                const row =
                    pending.find(
                        r =>
                            r.event.id ===
                            rejected.eventId
                    );

                if (!row) {
                    continue;
                }


                if (
                    rejected.reason ===
                    "CONFLICT"
                ) {

                    await this.outbox.markConflict(
                        row.outboxId,
                        rejected.message
                    );

                    continue;
                }


                await this.outbox.markRejected(
                    row.outboxId,
                    rejected.message
                );
            }
        }


        /*
         * -------------------------------------------------------
         * 6. Pull remote events
         * -------------------------------------------------------
         */

        let pullResult:
            SyncPullResult;


        try {

            pullResult =
                await this.transport.pull(
                    cursor,
                    this.pullBatchSize
                );

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            return {
                kind: "transient",
                error: message,
                attempted: pending.length,
                cursor,
            };
        }


        /*
         * -------------------------------------------------------
         * 7. Apply pulled events
         * -------------------------------------------------------
         */

        if (
            pullResult.events.length > 0
        ) {

            await this.eventStore.applyRemoteEvents(
                pullResult.events
            );

        }


        /*
         * -------------------------------------------------------
         * 8. Advance cursor
         * -------------------------------------------------------
         */

        if (
            pullResult.cursor >
            cursor
        ) {

            await this.syncState.setCursor(
                pullResult.cursor
            );

            cursor =
                pullResult.cursor;
        }


        /*
         * -------------------------------------------------------
         * 9. Determine final result
         * -------------------------------------------------------
         */

        const conflicts =
            pushedRejected.filter(
                rejection =>
                    rejection.reason ===
                    "CONFLICT"
            );


        if (conflicts.length > 0) {

            return {
                kind: "conflict",

                accepted:
                    pushedAccepted,

                rejected:
                    pushedRejected,

                conflicts,

                pulled:
                    pullResult.events.length,

                cursor,

                hasMore:
                    pullResult.hasMore,
            };
        }


        if (
            pushedRejected.length > 0
        ) {

            return {
                kind: "rejected",

                accepted:
                    pushedAccepted,

                rejected:
                    pushedRejected,

                pulled:
                    pullResult.events.length,

                cursor,

                hasMore:
                    pullResult.hasMore,
            };
        }


        if (
            pending.length === 0 &&
            pullResult.events.length === 0
        ) {

            return {
                kind: "idle",

                pushed: 0,

                pulled: 0,

                cursor,
            };
        }


        return {
            kind: "synced",

            pushed:
                pushedAccepted.length,

            rejected:
                pushedRejected.length,

            pulled:
                pullResult.events.length,

            cursor,

            hasMore:
                pullResult.hasMore,
        };
    }

    async getCurrentCursor(): Promise<number> {
        return await this.syncState.getCursor();
    }


    /**
     * Convert the local outbox row into the exact
     * backend wire representation.
     */
   private toBackendPayload(
        event: DomainEvent
    ): BackendEventPayload {

        return {
            id:
                event.id,

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

            businessId:
                event.businessId,

            branchId:
                event.branchId,

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

    /**
     * Exponential retry with jitter.
     */
    private async scheduleRetries(
            items: PendingOutboxEvent[],
            error: string,
            now: number
        ): Promise<void> {

            for (const item of items) {

                const attempt =
                    item.retryCount + 1;

                if (
                    attempt >=
                    item.maxAttempts
                ) {

                    await this.outbox.markRejected(
                        item.outboxId,
                        `max attempts exceeded: ${error}`
                    );

                    continue;
                }

                const backoff =
                    this.baseBackoffMs *
                    Math.pow(2, attempt - 1);

                const jitter =
                    Math.floor(
                        Math.random() * 500
                    );

                const nextRetryAt =
                    now +
                    backoff +
                    jitter;

                await this.outbox.scheduleRetry(
                    item.outboxId,
                    nextRetryAt,
                    error
                );
            }
        }
}
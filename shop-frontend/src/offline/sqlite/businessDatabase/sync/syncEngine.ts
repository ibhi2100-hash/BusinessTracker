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
    SQLiteOutboxRepository,
} from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";


export interface SyncStateRepository {

    getCursor(): Promise<number>;

    setCursor(cursor: number): Promise<void>;
}


export interface LocalEventStore {

    applyRemoteEvents(
        events: BackendAcceptedEvent[]
    ): Promise<void>;
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
            LocalEventStore,

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
                    row => row.outboxId
                );

            await this.outbox.lockBatch(
                outboxIds,
                lockUntil
            );


            const payloads:
                BackendEventPayload[] =
                pending.map(
                    row =>
                        this.toBackendPayload(row)
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
                            r.eventId ===
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
                            r.eventId ===
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


    /**
     * Convert the local outbox row into the exact
     * backend wire representation.
     */
    private toBackendPayload(
        row: OutboxRow
    ): BackendEventPayload {

        return {
            id:
                row.eventId,

            aggregateId:
                row.aggregateId,

            aggregateType:
                row.aggregateType,

            expectedAggregateVersion:
                row.expectedAggregateVersion,

            type:
                row.type,

            mode:
                row.mode,

            payload:
                row.payload,

            actor:
                row.actor,

            causationId:
                row.causationId,

            logicClock:
                row.logicClock,

            createdAt:
                row.createdAt,

            checksum:
                row.checksum,
        };
    }


    /**
     * Exponential retry with jitter.
     */
    private async scheduleRetries(
        rows: OutboxRow[],
        error: string,
        now: number
    ): Promise<void> {

        for (
            const row
            of rows
        ) {

            const attempt =
                row.retryCount + 1;


            if (
                attempt >=
                row.maxAttempts
            ) {

                await this.outbox.markRejected(
                    row.outboxId,
                    `max attempts exceeded: ${error}`
                );

                continue;
            }


            const backoff =
                this.baseBackoffMs *
                Math.pow(2, attempt);


            const jitter =
                Math.floor(
                    Math.random() * 500
                );


            const nextRetryAt =
                now +
                backoff +
                jitter;


            await this.outbox.scheduleRetry(
                row.outboxId,
                nextRetryAt,
                error
            );
        }
    }
}
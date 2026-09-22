// src/offline/sqlite/businessDatabase/repositories/SyncState/SQLiteSyncStateRepository.ts

import {
    BackendAcceptedEvent,
    Conflict,
    PersistedSyncState,
    SyncActivity,
    SyncRejected,
    SyncResult,
    SyncState,
    SyncStatus,
} from "@business/shared-types";

import { SyncStateStatements } from "../../statements/syncState/SyncStatements";
import { SQLiteSyncActivityRepository } from "./SQLiteActivityRepository";
import { SQLiteConflictRepository } from "./SQLiteConflictRepository";
import { SQLiteOutboxRepository } from "../SQLiteOutboxRepository/SQLiteOutboxRepository";

import { changeNotifier } from "../../projections/changeNoifier";

import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { syncStateKeys } from "../../statements/syncState/syncStateKeys";

export interface PersistSyncResultInput {
    result: SyncResult;
    startedAt: number;
    completedAt: number;
}

export interface PersistPushResultInput {
    pushResult: {
        accepted: BackendAcceptedEvent[];
        conflicts: Conflict[];
        rejected: SyncRejected[];
    };

    pendingAfterPush: number;

    completedAt: number;
}

export interface PersistPullResultInput {
    pulled: number;
    cursor: number;
    completedAt: number;
}

export class SQLiteSyncStateRepository {
    constructor(
        private readonly statements: SyncStateStatements,

        private readonly syncActivityRepo: SQLiteSyncActivityRepository,

        private readonly conflictRepo: SQLiteConflictRepository,

        private readonly outboxRepo: SQLiteOutboxRepository,

        private readonly transaction: TransactionManager
    ) {}

    // =========================================================
    // READ
    // =========================================================

    async get(): Promise<SyncState | null> {
        const rows = await this.statements.find.query<SyncState>();

        return rows[0] ?? null;
    }

    async getCursor(): Promise<number> {
        const state = await this.get();

        return state?.deviceCursor ?? 0;
    }

    async getState(): Promise<PersistedSyncState> {
        const [
            stateRows,
            activities,
            conflicts,
        ] = await Promise.all([
            this.statements.find.query<SyncState>(),
            this.syncActivityRepo.findRecent(50),
            this.conflictRepo.findPending(),
        ]);

        const row = stateRows[0];

        return {
            status: row?.status ?? "SYNCED",

            pendingEvents:
                row?.pendingEvents ?? 0,

            uploadedEvents:
                row?.uploadedEvents ?? 0,

            alreadyAcceptedEvents:
                row?.alreadyAcceptedEvents ?? 0,

            pulledEvents:
                row?.pulledEvents ?? 0,

            acceptedEvents:
                row?.acceptedEvents ?? 0,

            rejectedEvents:
                row?.rejectedEvents ?? 0,

            conflictEvents:
                row?.conflictEvents ?? 0,

            deviceCursor:
                row?.deviceCursor ?? 0,

            lastPulledGlobalPosition:
                row?.lastPulledGlobalPosition ?? 0,

            lastSyncAt:
                row?.lastSyncAt ?? null,

            lastSyncDurationMs:
                row?.lastSyncDurationMs ?? null,

            lastResult:
                safeParseResult(row?.lastResult),

            error:
                row?.error ?? null,

            activities,

            conflicts,
        };
    }

    // =========================================================
    // BASIC WRITES
    //
    // These are standalone writes.
    // They are NOT used when composing a larger transaction.
    // =========================================================

    async upsert(state: SyncState): Promise<void> {
        await this.statements.upsert.execute(
            SyncStateMapper.toUpsert(state)
        );

        changeNotifier.notify(["sync_state"]);
    }

    async updateStatus(
        status: SyncStatus,
        updatedAt: number
    ): Promise<void> {
        await this.statements.updateStatus.execute([
            status,
            updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    async setDeviceCursor(
        cursor: number,
        updatedAt: number
    ): Promise<void> {
        await this.statements.setDeviceCursor.execute([
            cursor,
            updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    async setCursor(cursor: number): Promise<void> {
        await this.setDeviceCursor(
            cursor,
            Date.now()
        );
    }

    async setError(
        error: string,
        updatedAt: number
    ): Promise<void> {
        await this.statements.setError.execute([
            error,
            updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    async clearError(updatedAt: number): Promise<void> {
        await this.statements.clearError.execute([
            updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    // =========================================================
    // OPERATION BUILDERS
    //
    // These DO NOT execute anything.
    // They are used by larger atomic transactions.
    // =========================================================

    updateAfterSyncOperation(params: {
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
    }): SQLiteStatementOperation {
        return {
            statementKey: syncStateKeys.updateAfterSync,

            params: [
                params.status,

                params.pendingEvents,

                params.uploadedEvents,

                params.alreadyAcceptedEvents,

                params.pulledEvents,

                params.acceptedEvents,

                params.rejectedEvents,

                params.conflictEvents,

                params.deviceCursor,

                params.lastPulledGlobalPosition,

                params.lastSyncAt,

                params.lastSyncDurationMs,

                params.lastResult,

                params.error,

                params.updatedAt,
            ],
        };
    }

    setDeviceCursorOperation(
        cursor: number,
        updatedAt: number
    ): SQLiteStatementOperation {
        return {
            statementKey: syncStateKeys.setDeviceCursor,

            params: [
                cursor,
                updatedAt,
            ],
        };
    }

    // =========================================================
    // COUNTERS
    // =========================================================

    async updateAfterSync(params: {
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

        lastSyncAt: number;

        lastSyncDurationMs: number;

        lastResult: string | null;

        error: string | null;

        updatedAt: number;
    }): Promise<void> {
        await this.statements.updateAfterSync.execute([
            params.status,

            params.pendingEvents,

            params.uploadedEvents,

            params.alreadyAcceptedEvents,

            params.pulledEvents,

            params.acceptedEvents,

            params.rejectedEvents,

            params.conflictEvents,

            params.deviceCursor,

            params.lastPulledGlobalPosition,

            params.lastSyncAt,

            params.lastSyncDurationMs,

            params.lastResult,

            params.error,

            params.updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    async incrementCounters(deltas: {
        pendingEvents?: number;

        uploadedEvents?: number;

        alreadyAcceptedEvents?: number;

        pulledEvents?: number;

        acceptedEvents?: number;

        rejectedEvents?: number;

        conflictEvents?: number;

        updatedAt: number;
    }): Promise<void> {
        await this.statements.incrementCounters.execute([
            deltas.pendingEvents ?? 0,

            deltas.uploadedEvents ?? 0,

            deltas.alreadyAcceptedEvents ?? 0,

            deltas.pulledEvents ?? 0,

            deltas.acceptedEvents ?? 0,

            deltas.rejectedEvents ?? 0,

            deltas.conflictEvents ?? 0,

            deltas.updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    async resetCounters(updatedAt: number): Promise<void> {
        await this.statements.resetCounters.execute([
            updatedAt,
        ]);

        changeNotifier.notify(["sync_state"]);
    }

    // =========================================================
    // FAILURE PERSISTENCE
    // =========================================================

    async persistFailure(params: {
        error: string;
        occurredAt: number;
    }): Promise<void> {
        const current = await this.get();

        const state: SyncState = {
            id: 1,

            status: "ERROR",

            pendingEvents:
                current?.pendingEvents ?? 0,

            uploadedEvents:
                current?.uploadedEvents ?? 0,

            alreadyAcceptedEvents:
                current?.alreadyAcceptedEvents ?? 0,

            pulledEvents:
                current?.pulledEvents ?? 0,

            acceptedEvents:
                current?.acceptedEvents ?? 0,

            rejectedEvents:
                current?.rejectedEvents ?? 0,

            conflictEvents:
                current?.conflictEvents ?? 0,

            deviceCursor:
                current?.deviceCursor ?? 0,

            lastPulledGlobalPosition:
                current?.lastPulledGlobalPosition ?? 0,

            lastSyncAt:
                current?.lastSyncAt ?? null,

            lastSyncDurationMs:
                current?.lastSyncDurationMs ?? null,

            lastResult:
                current?.lastResult ?? null,

            error:
                params.error,

            updatedAt:
                params.occurredAt,
        };

        await this.upsert(state);
    }

    // =========================================================
    // PUSH PERSISTENCE
    // =========================================================

    async persistPushResult(
        input: PersistPushResultInput
    ): Promise<void> {
        const {
            pushResult,
            pendingAfterPush,
            completedAt,
        } = input;

        const now = completedAt;

        /*
         * IMPORTANT:
         *
         * Read state BEFORE starting the transaction.
         *
         * Never perform another repository RPC from inside
         * transaction.run().
         */
        const current = await this.get();

        const summary = summarizePush(pushResult);

        const status = derivePushStatus(
            pushResult,
            pendingAfterPush
        );

        const operations: SQLiteStatementOperation[] = [];

        // -----------------------------------------------------
        // ACCEPTED EVENTS
        // -----------------------------------------------------

        for (const accepted of pushResult.accepted) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createAcceptedActivity(
                        accepted,
                        now
                    )
                )
            );
        }

        // -----------------------------------------------------
        // REJECTED EVENTS
        // -----------------------------------------------------

        for (const rejected of pushResult.rejected) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createRejectedActivity(
                        rejected,
                        now
                    )
                )
            );
        }

        // -----------------------------------------------------
        // CONFLICTS
        // -----------------------------------------------------

        for (const conflict of pushResult.conflicts) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createConflictActivity(
                        conflict,
                        now
                    )
                )
            );

            operations.push(
                this.conflictRepo.upsertOperation(
                    mapConflictToRow(
                        conflict,
                        now
                    )
                )
            );
        }

        // -----------------------------------------------------
        // SYNC STATE
        // -----------------------------------------------------

        operations.push(
            this.updateAfterSyncOperation({
                status,

                pendingEvents:
                    pendingAfterPush,

                uploadedEvents:
                    (current?.uploadedEvents ?? 0) +
                    summary.pushed,

                alreadyAcceptedEvents:
                    (current?.alreadyAcceptedEvents ?? 0) +
                    summary.alreadyAccepted,

                pulledEvents:
                    current?.pulledEvents ?? 0,

                acceptedEvents:
                    (current?.acceptedEvents ?? 0) +
                    summary.accepted,

                rejectedEvents:
                    (current?.rejectedEvents ?? 0) +
                    summary.rejected,

                conflictEvents:
                    (current?.conflictEvents ?? 0) +
                    summary.conflicts,

                deviceCursor:
                    current?.deviceCursor ?? 0,

                lastPulledGlobalPosition:
                    current?.lastPulledGlobalPosition ?? 0,

                lastSyncAt:
                    current?.lastSyncAt ?? now,

                lastSyncDurationMs:
                    current?.lastSyncDurationMs ?? null,

                lastResult:
                    current?.lastResult ?? null,

                error: null,

                updatedAt: now,
            })
        );

        /*
         * ONE transaction RPC.
         */
        await this.transaction.run(operations);

        /*
         * Notify ONLY after COMMIT succeeded.
         */
        changeNotifier.notify([
            "sync_state",
            "sync_activities",
            "conflicts",
            "outbox",
        ]);
    }

    // =========================================================
    // PULL PERSISTENCE
    // =========================================================

    async persistPullResult(
        input: PersistPullResultInput
    ): Promise<void> {
        const {
            pulled,
            cursor,
            completedAt,
        } = input;

        /*
         * Read BEFORE transaction.
         */
        const current = await this.get();

        const operations: SQLiteStatementOperation[] = [];

        /*
         * Cursor must always be persisted,
         * including when pulled === 0.
         */
        operations.push(
            this.setDeviceCursorOperation(
                cursor,
                completedAt
            )
        );

        /*
         * Only update pull counters when events
         * were actually pulled.
         */
        if (pulled > 0) {
            operations.push(
                this.updateAfterSyncOperation({
                    status:
                        current?.status ?? "SYNCED",

                    pendingEvents:
                        current?.pendingEvents ?? 0,

                    uploadedEvents:
                        current?.uploadedEvents ?? 0,

                    alreadyAcceptedEvents:
                        current?.alreadyAcceptedEvents ?? 0,

                    pulledEvents:
                        (current?.pulledEvents ?? 0) +
                        pulled,

                    acceptedEvents:
                        current?.acceptedEvents ?? 0,

                    rejectedEvents:
                        current?.rejectedEvents ?? 0,

                    conflictEvents:
                        current?.conflictEvents ?? 0,

                    deviceCursor:
                        cursor,

                    lastPulledGlobalPosition:
                        cursor,

                    lastSyncAt:
                        completedAt,

                    lastSyncDurationMs:
                        current?.lastSyncAt != null
                            ? completedAt -
                              current.lastSyncAt
                            : current?.lastSyncDurationMs ??
                              null,

                    lastResult:
                        current?.lastResult ?? null,

                    error:
                        current?.error ?? null,

                    updatedAt:
                        completedAt,
                })
            );
        }

        /*
         * ONE transaction RPC.
         */
        await this.transaction.run(operations);

        /*
         * Notify after commit.
         */
        changeNotifier.notify([
            "sync_state",
        ]);
    }

    // =========================================================
    // COMBINED SYNC PERSISTENCE
    // =========================================================

    async persistSyncResult(
        input: PersistSyncResultInput
    ): Promise<void> {
        console.log(
            "SyncEngine result:",
            input
        );

        const {
            result,
            startedAt,
            completedAt,
        } = input;

        const now = completedAt;

        /*
         * These are READS.
         *
         * They happen before the transaction.
         */
        const [
            pendingEvents,
            cursor,
        ] = await Promise.all([
            this.outboxRepo.getPendingCount(now),
            this.getCursor(),
        ]);

        const operations: SQLiteStatementOperation[] = [];

        // -----------------------------------------------------
        // ACTIVITIES
        // -----------------------------------------------------

        for (const accepted of getAccepted(result)) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createAcceptedActivity(
                        accepted,
                        now
                    )
                )
            );
        }

        for (const rejected of getRejected(result)) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createRejectedActivity(
                        rejected,
                        now
                    )
                )
            );
        }

        // -----------------------------------------------------
        // CONFLICTS
        // -----------------------------------------------------

        for (const conflict of getConflicts(result)) {
            operations.push(
                this.syncActivityRepo.insertOperation(
                    createConflictActivity(
                        conflict,
                        now
                    )
                )
            );

            operations.push(
                this.conflictRepo.upsertOperation(
                    mapConflictToRow(
                        conflict,
                        now
                    )
                )
            );
        }

        // -----------------------------------------------------
        // RESULT SUMMARY
        // -----------------------------------------------------

        const summary =
            summarizeResult(result);

        const status =
            deriveStatus(
                result,
                pendingEvents
            );

        // -----------------------------------------------------
        // SYNC STATE
        // -----------------------------------------------------

        operations.push(
            this.updateAfterSyncOperation({
                status,

                pendingEvents,

                uploadedEvents:
                    summary.pushed,

                alreadyAcceptedEvents:
                    summary.alreadyAccepted,

                pulledEvents:
                    summary.pulled,

                acceptedEvents:
                    summary.accepted,

                rejectedEvents:
                    summary.rejected,

                conflictEvents:
                    summary.conflicts,

                deviceCursor:
                    cursor,

                lastPulledGlobalPosition:
                    result.cursor ?? cursor,

                lastSyncAt:
                    completedAt,

                lastSyncDurationMs:
                    completedAt -
                    startedAt,

                lastResult:
                    JSON.stringify(result),

                error:
                    result.kind === "transient"
                        ? result.error
                        : null,

                updatedAt:
                    completedAt,
            })
        );

        /*
         * ONE transaction RPC.
         */
        await this.transaction.run(operations);

        /*
         * Notify AFTER successful COMMIT.
         */
        changeNotifier.notify([
            "sync_state",
            "sync_activities",
            "conflicts",
            "outbox",
        ]);
    }
}

// ============================================================
// SYNC STATE MAPPER
// ============================================================

export class SyncStateMapper {
    static toUpsert(
        state: SyncState
    ): unknown[] {
        return [
            1,

            state.status,

            state.pendingEvents,

            state.uploadedEvents,

            state.alreadyAcceptedEvents,

            state.pulledEvents,

            state.acceptedEvents,

            state.rejectedEvents,

            state.conflictEvents,

            state.deviceCursor,

            state.lastPulledGlobalPosition,

            state.lastSyncAt ?? null,

            state.lastSyncDurationMs ?? null,

            state.lastResult ?? null,

            state.error ?? null,

            state.updatedAt,
        ];
    }
}

// ============================================================
// PROJECTION HELPERS
// ============================================================

interface PushSummary {
    pushed: number;

    accepted: number;

    alreadyAccepted: number;

    rejected: number;

    conflicts: number;
}

interface FullSummary
    extends PushSummary {
    pulled: number;
}

function summarizePush(
    pushResult: {
        accepted: BackendAcceptedEvent[];

        conflicts: Conflict[];

        rejected: SyncRejected[];
    }
): PushSummary {
    const accepted =
        pushResult.accepted.filter(
            event =>
                event.status === "ACCEPTED"
        ).length;

    const alreadyAccepted =
        pushResult.accepted.filter(
            event =>
                event.status ===
                "ALREADY_ACCEPTED"
        ).length;

    return {
        pushed:
            pushResult.accepted.length +
            pushResult.rejected.length +
            pushResult.conflicts.length,

        accepted,

        alreadyAccepted,

        rejected:
            pushResult.rejected.length,

        conflicts:
            pushResult.conflicts.length,
    };
}

function summarizeResult(
    result: SyncResult
): FullSummary {
    switch (result.kind) {
        case "idle":
            return {
                pushed: 0,
                accepted: 0,
                alreadyAccepted: 0,
                rejected: 0,
                conflicts: 0,
                pulled: result.pulled,
            };

        case "synced":
        case "rejected":
        case "conflict": {
            const accepted =
                result.accepted.filter(
                    event =>
                        event.status ===
                        "ACCEPTED"
                ).length;

            const alreadyAccepted =
                result.accepted.filter(
                    event =>
                        event.status ===
                        "ALREADY_ACCEPTED"
                ).length;

            const conflicts =
                result.kind === "conflict"
                    ? result.conflicts.length
                    : 0;

            /*
             * IMPORTANT:
             *
             * Never hard-code pushed = 20.
             *
             * The actual number pushed is the number
             * of accepted + rejected + conflict responses.
             */
            const pushed =
                result.accepted.length +
                result.rejected.length +
                conflicts;

            return {
                pushed,

                accepted,

                alreadyAccepted,

                rejected:
                    result.rejected.length,

                conflicts,

                pulled:
                    result.pulled,
            };
        }

        case "transient":
            return {
                pushed: 0,
                accepted: 0,
                alreadyAccepted: 0,
                rejected: 0,
                conflicts: 0,
                pulled: 0,
            };
    }
}

function deriveStatus(
    result: SyncResult,
    pending: number
): SyncStatus {
    if (result.kind === "transient") {
        return "ERROR";
    }

    if (result.kind === "conflict") {
        return "CONFLICT";
    }

    if (result.kind === "rejected") {
        return "ERROR";
    }

    if (pending > 0) {
        return "PENDING";
    }

    return "SYNCED";
}

function derivePushStatus(
    pushResult: {
        accepted: BackendAcceptedEvent[];

        conflicts: Conflict[];

        rejected: SyncRejected[];
    },

    pendingAfterPush: number
): SyncStatus {
    if (
        pushResult.conflicts.length > 0
    ) {
        return "CONFLICT";
    }

    if (
        pushResult.rejected.length > 0
    ) {
        return "ERROR";
    }

    if (pendingAfterPush > 0) {
        return "PENDING";
    }

    return "SYNCED";
}

function getAccepted(
    result: SyncResult
): BackendAcceptedEvent[] {
    return "accepted" in result
        ? result.accepted
        : [];
}

function getRejected(
    result: SyncResult
): SyncRejected[] {
    return "rejected" in result
        ? result.rejected
        : [];
}

function getConflicts(
    result: SyncResult
): Conflict[] {
    return result.kind === "conflict"
        ? result.conflicts
        : [];
}

function safeParseResult(
    raw: string | null | undefined
): SyncResult | null {
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as SyncResult;
    } catch {
        return null;
    }
}

// ============================================================
// ACTIVITY FACTORIES
// ============================================================

function createAcceptedActivity(
    event: BackendAcceptedEvent,
    createdAt: number
): Omit<SyncActivity, "id"> {
    const alreadyAccepted =
        event.status ===
        "ALREADY_ACCEPTED";

    return {
        activityId:
            `sync:${event.eventId}:${event.status}`,

        type:
            alreadyAccepted
                ? "EVENT_ALREADY_ACCEPTED"
                : "EVENT_ACCEPTED",

        status:
            alreadyAccepted
                ? "ALREADY_ACCEPTED"
                : "ACCEPTED",

        syncInfo:
            alreadyAccepted
                ? "INFO"
                : "SUCCESS",

        message:
            alreadyAccepted
                ? "The server had already accepted this event."
                : "Event accepted by the server.",

        eventId:
            event.eventId,

        aggregateType:
            event.aggregateType,

        aggregateId:
            event.aggregateId,

        sequenceNumber:
            event.globalPosition ?? null,

        createdAt,

        metadata: {
            aggregateVersion:
                event.aggregateVersion,

            globalPosition:
                event.globalPosition,

            responseStatus:
                event.status,
        },
    };
}

function createRejectedActivity(
    event: SyncRejected,
    createdAt: number
): Omit<SyncActivity, "id"> {
    return {
        activityId:
            `sync:${event.eventId}:REJECTED`,

        type:
            "EVENT_REJECTED",

        syncInfo:
            "ERROR",

        message:
            event.reason ??
            "Event rejected by server.",

        eventId:
            event.eventId,

        aggregateType:
            event.aggregateType ??
            "UNKNOWN",

        aggregateId:
            event.aggregateId ??
            "",

        sequenceNumber:
            null,

        createdAt,

        metadata: {
            reason:
                event.reason ?? null,
        },
    };
}

function createConflictActivity(
    conflict: Conflict,
    createdAt: number
): Omit<SyncActivity, "id"> {
    return {
        activityId:
            `sync:${conflict.eventId}:CONFLICT`,

        type:
            "CONFLICT_DETECTED",

        syncInfo:
            "WARNING",

        message:
            `Version mismatch — expected ` +
            `${conflict.expectedAggregateVersion}, ` +
            `server has ${conflict.aggregateVersion}`,

        eventId:
            conflict.eventId,

        aggregateType:
            conflict.aggregateType,

        aggregateId:
            conflict.aggregateId,

        sequenceNumber:
            null,

        createdAt,

        metadata: {
            expectedAggregateVersion:
                conflict.expectedAggregateVersion,

            serverAggregateVersion:
                conflict.aggregateVersion,
        },
    };
}

// ============================================================
// CONFLICT ROW MAPPER
// ============================================================

function mapConflictToRow(
    conflict: Conflict,
    now: number
): Conflict {
    return {
        eventId:
            conflict.eventId,

        aggregateId:
            conflict.aggregateId,

        aggregateType:
            conflict.aggregateType,

        expectedAggregateVersion:
            conflict.expectedAggregateVersion,

        aggregateVersion:
            conflict.aggregateVersion,

        status:
            "PENDING",

        /*
         * NOTE:
         *
         * aggregateVersion is a number.
         * It should NOT be used as serverEvents.
         *
         * Preserve the version information explicitly.
         */
        payload: JSON.stringify({
            serverAggregateVersion:
                conflict.aggregateVersion,

            expectedAggregateVersion:
                conflict.expectedAggregateVersion,
        }),

        createdAt:
            now,

        resolvedAt:
            null,

        updatedAt:
            now,
    };
}
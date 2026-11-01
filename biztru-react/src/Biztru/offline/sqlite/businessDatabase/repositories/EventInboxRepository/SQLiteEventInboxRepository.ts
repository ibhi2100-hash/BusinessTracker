
import type { BackendEvent } from "@business/shared-types";
import type { EventInboxRepository } from "./contracts";
import { EventInboxStatements } from "../../statements/eventInbox/EventInboxStatements";
import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { EventInboxStatementKeys } from "../../statements/eventInbox/key";

interface EventInboxRow {
    eventId: string;
    businessId: string;
    branchId: string | null;

    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;

    type: string;
    payload: string;
    mode: BackendEvent["mode"];

    userId: string;
    deviceId: string;

    causationId: string | null;
    correlationId: string | null;

    globalPosition: number | string;
    logicClock: number | string;

    checksum: string | null;
    createdAt: number;
    receivedAt: number;

    attempts: number;
    lastError: string | null;

    status: "PENDING" | "PROCESSING";
    processingAt: number | null;
}

export class SQLiteEventInboxRepository
    implements EventInboxRepository {
    private readonly statements: EventInboxStatements

    private static readonly RECOVERY_TIMEOUT = 5 * 60 * 1000;
    constructor(
        statements: EventInboxStatements
    ) {
        this.statements = statements
    }

     private toTimestamp(value: unknown): number {
        const timestamp =
            value instanceof Date
                ? value.getTime()
                : typeof value === "number"
                    ? value
                    : typeof value === "string"
                        ? Date.parse(value)
                        : NaN;

        if (!Number.isFinite(timestamp)) {
            throw new Error(
                `Invalid event createdAt value: ${String(value)}`
            );
        }

        return timestamp;
    }

    private toParams(event: BackendEvent): unknown[] {
        return [
            event.id,
            event.businessId,
            event.branchId ?? null,

            event.aggregateId,
            event.aggregateType,
            event.aggregateVersion,

            event.type,
            JSON.stringify(event.payload),
            event.mode,

            event.userId,
            event.deviceId,

            event.causationId ?? null,
            event.correlationId ?? null,

            String(event.globalPosition),
            event.logicClock,

            event.checksum ?? null,

            this.toTimestamp(event.createdAt),
            Date.now(),
        ];
    }
    async stage(
        events: readonly BackendEvent[],
    ): Promise<void> {

        for (const event of events) {
            try {
                await this.statements.insert.execute(
                    this.toParams(event)
                );
            } catch (error) {
                console.error("INBOX STAGING FAILED:", {
                    eventId: event.id,
                    error,
                });

                throw error;
            }
        }
    }

    async loadPending(
        limit: number,
    ): Promise<BackendEvent[]> {

        if (!Number.isSafeInteger(limit) || limit < 1) {
            throw new Error(
                "Inbox limit must be a positive safe integer."
            );
        }

        // 1. Recover records abandoned by crashed processors.
        const recoveryDeadline =
            Date.now() - SQLiteEventInboxRepository.RECOVERY_TIMEOUT;

        await this.statements.recoverStale.execute([
            recoveryDeadline,
        ]);

        // 2. Atomically claim pending events.
        const rows =
            await this.statements.loadPending.query<EventInboxRow>([
                Date.now(),
                limit,
            ]);

        // RETURNING does not guarantee ordering.
        rows.sort((a, b) => {
            const left = BigInt(a.globalPosition);
            const right = BigInt(b.globalPosition);

            return left < right ? -1 : left > right ? 1 : 0;
        });

        // 3. Transform database rows into backend events.
        return rows.map(row => ({
            id: row.eventId,

            businessId: row.businessId,
            branchId: row.branchId,

            aggregateId: row.aggregateId,
            aggregateType: row.aggregateType,
            aggregateVersion: row.aggregateVersion,

            type: row.type,
            payload: JSON.parse(row.payload),

            mode: row.mode,

            userId: row.userId,
            deviceId: row.deviceId,

            causationId: row.causationId,
            correlationId: row.correlationId,

            globalPosition: BigInt(row.globalPosition),
            logicClock: BigInt(row.logicClock),

            checksum: row.checksum,

            createdAt: new Date(row.createdAt),
        }));
    }

    async remove(eventId: string): Promise<void> {
        await this.statements.delete.execute([eventId]);
    }

    async recordFailure(
        eventId: string,
        error: string,
    ): Promise<void> {

        await this.statements.recordFailure.execute([
            error,
            eventId,
        ]);
    }

    async count(): Promise<number> {
        const rows = await this.statements.count.query<{
            count: number;
        }>([]);

        return rows[0]?.count ?? 0;
    }

    async recordBatchFailure(
        eventIds: readonly string[],
        error: string,
    ): Promise<void> {

        for (const eventId of eventIds) {
            await this.recordFailure(eventId, error);
        }
    }


    insertOperations(
        events: readonly BackendEvent[],
    ): SQLiteStatementOperation[] {
        return events.map((event) => ({
            statementKey: EventInboxStatementKeys.insert,
            params: [
                event.id,
                event.businessId,
                event.branchId ?? null,
                event.aggregateId,
                event.aggregateType,
                event.aggregateVersion,
                event.type,
                JSON.stringify(event.payload),
                event.mode,
                event.userId,
                event.deviceId,
                event.causationId ?? null,
                event.correlationId ?? null,
                String(event.globalPosition),
                event.logicClock,
                event.checksum,
                event.createdAt,
                Date.now(),
            ],
        }));
    }

    async insert(event: BackendEvent): Promise<void> {
        await this.statements.insert.execute([
            event.id,
            event.businessId,
            event.branchId ?? null,
            event.aggregateId,
            event.aggregateType,
            event.aggregateVersion,
            event.type,
            JSON.stringify(event.payload),
            event.mode,
            event.userId,
            event.deviceId,
            event.causationId ?? null,
            event.correlationId ?? null,
            String(event.globalPosition),
            event.logicClock,
            event.checksum,
            event.createdAt,
            Date.now(),
        ]);
    }

    deleteOperations(
        eventIds: readonly string[],
    ): SQLiteStatementOperation[] {
        return eventIds.map((eventId) => ({
            statementKey: EventInboxStatementKeys.delete,
            params: [eventId],
        }));
    }

    recordFailureOperation(
        eventId: string,
        error: string,
    ): SQLiteStatementOperation {
        return {
            statementKey: EventInboxStatementKeys.recordFailure,
            params: [
                error,
                eventId,
            ],
        };
    }

    async allInbox(){
        const allInbox = await this.statements.allInbox.query();

        return allInbox
    }
}

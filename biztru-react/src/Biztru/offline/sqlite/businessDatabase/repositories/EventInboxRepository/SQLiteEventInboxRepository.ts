
import type { BackendEvent } from "@business/shared-types";
import type { EventInboxRepository } from "./contracts";
import { EventInboxStatements } from "../../statements/eventInbox/EventInboxStatements";

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

    globalPosition: number;
    logicClock: number;

    checksum: string | null;
    createdAt: number;
    receivedAt: number;

    attempts: number;
    lastError: string | null;
}

export class SQLiteEventInboxRepository
    implements EventInboxRepository {
    private readonly statements: EventInboxStatements
    constructor(
        statements: EventInboxStatements
    ) {
        this.statements = statements
    }

    private toParams(event: BackendEvent): unknown[] {
        return [
            event.id,
            event.businessId,
            event.branchId,
            event.aggregateId,
            event.aggregateType,
            event.aggregateVersion,
            event.type,
            JSON.stringify(event.payload),
            event.mode,
            event.userId,
            event.deviceId,
            event.causationId,
            event.correlationId,
            event.globalPosition,
            event.logicClock,
            event.checksum,
            event.createdAt.getTime(),
            Date.now()
        ];
    }

    async stage(
        events: readonly BackendEvent[]
    ): Promise<void> {
        for (const event of events) {
            await this.statements.insert.execute(
                this.toParams(event)
            );
        }
    }

    async loadPending(
        limit = 100
    ): Promise<BackendEvent[]> {
        const rows =
            await this.statements.loadPending.query<EventInboxRow>([
                limit
            ]);

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
            createdAt: new Date(row.createdAt)
        }));
    }

    async remove(eventId: string): Promise<void> {
        await this.statements.delete.execute([eventId]);
    }

    async recordFailure(
        eventId: string,
        error: string
    ): Promise<void> {
        await this.statements.recordFailure.execute([
            error,
            eventId
        ]);
    }

    async exists(eventId: string): Promise<boolean> {
        return this.statements.exists.exists([eventId]);
    }

    async count(): Promise<number> {
        const rows = await this.statements.count.query<{
            count: number;
        }>([]);

        return rows[0]?.count ?? 0;
    }
}

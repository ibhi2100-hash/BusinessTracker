import {
    SyncActivity,
    SyncActivityType,
} from "@business/shared-types";

import { SyncActivityStatements } from "../../statements/syncActivities/ActivityStatements";

import {
    changeNotifier,
} from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";

import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { syncActivityKeys } from "../../statements/syncActivities/syncActivityKeys";

interface SyncActivityRow {
    id: number;
    activityId: string;
    type: string;

    status:
        | "ACCEPTED"
        | "ALREADY_ACCEPTED"
        | "REJECTED"
        | "CONFLICT";

    message: string;

    eventId: string | null;

    aggregateType: string;
    aggregateId: string;

    sequenceNumber: number | null;

    createdAt: number;

    metadata: string | null;
}

export class SQLiteSyncActivityRepository {

    constructor(
        private readonly statements: SyncActivityStatements
    ) {}

    // =========================================================
    // TRANSACTIONAL WRITE
    // =========================================================

    insertOperation(
        activity: Omit<SyncActivity, "id">
    ): SQLiteStatementOperation {

        return {
            statementKey: syncActivityKeys.insert,
            params: SyncActivityMapper.toInsert(activity),
        };
    }

    // =========================================================
    // STANDALONE WRITE
    // =========================================================

    async insert(
        activity: Omit<SyncActivity, "id">
    ): Promise<void> {

        const operation =
            this.insertOperation(activity);

        await this.statements.insert.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "sync_activities",
        ]);
    }

    // =========================================================
    // READ
    // =========================================================

    async findById(
        id: number
    ): Promise<SyncActivity | null> {

        const rows =
            await this.statements.findById.query<any>([
                id,
            ]);

        return rows[0]
            ? SyncActivityMapper.fromRow(rows[0])
            : null;
    }

    async findByActivityId(
        activityId: string
    ): Promise<SyncActivity | null> {

        const rows =
            await this.statements.findByActivityId.query<any>([
                activityId,
            ]);

        return rows[0]
            ? SyncActivityMapper.fromRow(rows[0])
            : null;
    }

    async findRecent(
        limit = 50
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findRecent.query<any>([
                limit,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findByType(
        type: SyncActivityType,
        limit = 50
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findByType.query<any>([
                type,
                limit,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findByEvent(
        eventId: string
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findByEvent.query<any>([
                eventId,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findByAggregate(
        aggregateType: string,
        aggregateId: string
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findByAggregate.query<any>([
                aggregateType,
                aggregateId,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findByTypeAndRange(
        type: SyncActivityType,
        from: number,
        to: number
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findByTypeAndRange.query<any>([
                type,
                from,
                to,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findInRange(
        from: number,
        to: number
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findInRange.query<any>([
                from,
                to,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async findErrors(
        limit = 50
    ): Promise<SyncActivity[]> {

        const rows =
            await this.statements.findErrors.query<any>([
                limit,
            ]);

        return rows.map(
            SyncActivityMapper.fromRow
        );
    }

    async countByType(
        type: SyncActivityType
    ): Promise<number> {

        const rows =
            await this.statements.countByType.query<{
                count: number;
            }>([
                type,
            ]);

        return rows[0]?.count ?? 0;
    }

    // =========================================================
    // MAINTENANCE
    // =========================================================

    async deleteOlderThan(
        timestamp: number
    ): Promise<void> {

        await this.statements.deleteOlderThan.execute([
            timestamp,
        ]);

        changeNotifier.notify([
            "sync_activities",
        ]);
    }

    async delete(
        id: number
    ): Promise<void> {

        await this.statements.deleteById.execute([
            id,
        ]);

        changeNotifier.notify([
            "sync_activities",
        ]);
    }
}

export class SyncActivityMapper {

    static toInsert(
        a: Omit<SyncActivity, "id">
    ): unknown[] {

        return [
            a.activityId,
            a.type,
            a.status ?? null,
            a.message ?? null,
            a.eventId ?? null,
            a.aggregateType ?? null,
            a.aggregateId ?? null,
            a.sequenceNumber ?? null,
            a.createdAt,
            a.metadata
                ? JSON.stringify(a.metadata)
                : null,
        ];
    }

    static fromRow(
        row: SyncActivityRow
    ): SyncActivity {

        return {
            id: row.id,
            activityId: row.activityId,
            type: row.type as SyncActivityType,
            status: row.status ?? null,
            message: row.message ?? null,
            eventId: row.eventId ?? null,
            aggregateType: row.aggregateType ?? null,
            aggregateId: row.aggregateId ?? null,
            sequenceNumber: row.sequenceNumber ?? null,
            createdAt: row.createdAt,
            metadata: row.metadata
                ? JSON.parse(row.metadata)
                : null,
        };
    }
}
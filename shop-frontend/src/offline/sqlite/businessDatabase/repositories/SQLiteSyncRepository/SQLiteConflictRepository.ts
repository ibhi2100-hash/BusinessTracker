import { Conflict } from "@business/shared-types";

import { ConflictsStatements } from "../../statements/conflicts/conflictsStatement";

import {
    changeNotifier,
} from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";

import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { conflictKeys } from "../../statements/conflicts/conflictKeys";

export class SQLiteConflictRepository {

    constructor(
        private readonly statements: ConflictsStatements
    ) {}

    // =========================================================
    // TRANSACTIONAL OPERATIONS
    // =========================================================

    insertOperation(
        conflict: Conflict
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.insert,
            params: ConflictMapper.toInsert(conflict),
        };
    }

    upsertOperation(
        conflict: Conflict
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.upsert,
            params: ConflictMapper.toUpsert(conflict),
        };
    }

    resolveOperation(
        id: number,
        status: string,
        resolvedAt: number,
        updatedAt: number
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.resolve,
            params: [
                status,
                resolvedAt,
                updatedAt,
                id,
            ],
        };
    }

    updateStatusOperation(
        id: number,
        status: string,
        updatedAt: number
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.updateStatus,
            params: [
                status,
                updatedAt,
                id,
            ],
        };
    }

    deleteOperation(
        id: number
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.deleteById,
            params: [
                id,
            ],
        };
    }

    deleteByAggregateOperation(
        aggregateType: string,
        aggregateId: string
    ): SQLiteStatementOperation {

        return {
            statementKey: conflictKeys.deleteByAggregate,
            params: [
                aggregateType,
                aggregateId,
            ],
        };
    }

    // =========================================================
    // STANDALONE WRITES
    // =========================================================

    async insert(
        conflict: Conflict
    ): Promise<void> {

        const operation =
            this.insertOperation(conflict);

        await this.statements.insert.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    async upsert(
        conflict: Conflict
    ): Promise<void> {

        const operation =
            this.upsertOperation(conflict);

        await this.statements.upsert.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    async resolve(
        id: number,
        status: string,
        resolvedAt: number,
        updatedAt: number
    ): Promise<void> {

        const operation =
            this.resolveOperation(
                id,
                status,
                resolvedAt,
                updatedAt
            );

        await this.statements.resolve.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    async updateStatus(
        id: number,
        status: string,
        updatedAt: number
    ): Promise<void> {

        const operation =
            this.updateStatusOperation(
                id,
                status,
                updatedAt
            );

        await this.statements.updateStatus.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    async delete(
        id: number
    ): Promise<void> {

        const operation =
            this.deleteOperation(id);

        await this.statements.deleteById.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    async deleteByAggregate(
        aggregateType: string,
        aggregateId: string
    ): Promise<void> {

        const operation =
            this.deleteByAggregateOperation(
                aggregateType,
                aggregateId
            );

        await this.statements.deleteByAggregate.execute(
            operation.params ?? []
        );

        changeNotifier.notify([
            "conflicts",
        ]);
    }

    // =========================================================
    // READ
    // =========================================================

    async findById(
        id: number
    ): Promise<Conflict | null> {

        const rows =
            await this.statements.findById.query<Conflict>([
                id,
            ]);

        return rows[0] ?? null;
    }

    async findByAggregate(
        aggregateType: string,
        aggregateId: string
    ): Promise<Conflict[]> {

        return this.statements.findByAggregate.query<Conflict>([
            aggregateType,
            aggregateId,
        ]);
    }

    async findByStatus(
        status: string
    ): Promise<Conflict[]> {

        return this.statements.findByStatus.query<Conflict>([
            status,
        ]);
    }

    async findPending(): Promise<Conflict[]> {

        return this.statements.findPending.query<Conflict>();
    }

    async findPendingByAggregate(
        aggregateType: string,
        aggregateId: string
    ): Promise<Conflict[]> {

        return this.statements.findPendingByAggregate.query<Conflict>([
            aggregateType,
            aggregateId,
        ]);
    }

    async countByStatus(
        status: string
    ): Promise<number> {

        const rows =
            await this.statements.countByStatus.query<{
                count: number;
            }>([
                status,
            ]);

        return rows[0]?.count ?? 0;
    }

    async countPending(): Promise<number> {

        return this.countByStatus("PENDING");
    }
}

export class ConflictMapper {

    static toInsert(
        c: Conflict
    ): unknown[] {

        return [
            c.eventId,
            c.aggregateId,
            c.aggregateType,
            c.expectedAggregateVersion,
            c.aggregateVersion,
            c.status ?? "PENDING",
            c.payload ?? null,
            c.createdAt,
            c.resolvedAt ?? null,
            c.updatedAt,
        ];
    }

    static toUpsert(
        c: Conflict
    ): unknown[] {

        return [
            c.eventId,
            c.aggregateId,
            c.aggregateType,
            c.expectedAggregateVersion,
            c.aggregateVersion,
            c.status,
            c.payload ?? null,
            c.createdAt,
            c.resolvedAt ?? null,
            c.updatedAt,
        ];
    }
}
// SQLiteBranchRepository.ts

import type{ Branch } from "@business/shared-types";
import {
    BranchStatements,
} from "../../statements/branch/BranchStatements";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BranchStatementKeys } from "../../statements/branch/BranchStatementKeys";


export class SQLiteBranchRepository
{   private readonly statements: BranchStatements;
    constructor(
        statements: BranchStatements
    ) {
        this.statements = statements
    }


    // ============================================================
    // TRANSACTION OPERATIONS
    // ============================================================

    insertOperation(
        state: Branch
    ): SQLiteStatementOperation {

        return {
            statementKey:
                BranchStatementKeys.insert,

            params:
                BranchMapper.toInsert(state),
        };
    }


    // ============================================================
    // IMMEDIATE WRITE
    // ============================================================

    async upsert(
        state: Branch
    ): Promise<void> {

        await this.statements.insert.execute(
            BranchMapper.toInsert(state)
        );
    }


    async delete(
        id: string
    ): Promise<void> {

        await this.statements.delete.execute([
            id,
        ]);
    }


    // ============================================================
    // READS
    // ============================================================

    async findById(
        id: string
    ): Promise<Branch | null> {

        const rows =
            await this.statements.findById.query<Branch>([
                id,
            ]);

        return rows[0] ?? null;
    }


    async findAll(businessId: string): Promise<Branch[]> {

        return this.statements.findAll.query<Branch>([businessId]);
    }
}


// ================================================================
// MAPPER
// ================================================================

export class BranchMapper {

    static toInsert(
        branch: Branch
    ): unknown[] {

        return [
            branch.id,
            branch.businessId,
            branch.name,
            branch.address ?? null,
            branch.phone ?? null,
            branch.isActive ? 1 : 0,
            branch.createdAt,
            branch.isDefault ? 1 : 0,
        ];
    }
}
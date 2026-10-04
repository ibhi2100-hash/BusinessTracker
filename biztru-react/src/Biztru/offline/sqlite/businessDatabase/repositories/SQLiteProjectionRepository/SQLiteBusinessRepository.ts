// SQLiteBusinessRepository.ts

import type{ Business } from "@business/shared-types";

import type{
    IProjectionEntityRepository,
} from "./repositoryContract";

import {
    BusinessStatements,
} from "../../statements/business/BusinessStatements";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { businessKeys } from "../../statements/business/businessKeys";


export class SQLiteBusinessRepository
    implements IProjectionEntityRepository<Business>
{   
    private readonly statements: BusinessStatements
    constructor(
        statements: BusinessStatements
    ) {
        this.statements = statements
    }

    // ============================================================
    // TRANSACTION OPERATIONS
    // ============================================================

    upsertOperation(
        state: Business
    ): SQLiteStatementOperation {

        return {
            statementKey:
                businessKeys.businessUpsert,

            params:
                BusinessMapper.toInsert(state),
        };
    }

    activateBusinessOperation(
        state: Business
    ): SQLiteStatementOperation {

        return {
            statementKey:
                businessKeys.businessActivation,

            params:
                BusinessMapper.toActivation(state),
        };
    }


    // ============================================================
    // IMMEDIATE WRITES
    // ============================================================

    async upsert(
        state: Business
    ): Promise<void> {

        await this.statements.upsert.execute(
            BusinessMapper.toInsert(state)
        );
    }


    async activateBusiness(
        state: Business
    ): Promise<void> {

        await this.statements.activate.execute(
            BusinessMapper.toActivation(state)
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
    ): Promise<Business | null> {

        const rows =
            await this.statements.findById.query<Business>([
                id,
            ]);

        return rows[0] ?? null;
    }


    async findAll(): Promise<Business[]> {

        return this.statements.findAll.query<Business>([]);
    }
}


// ================================================================
// MAPPER
// ================================================================

export class BusinessMapper {

    static toInsert(
        business: Business
    ): unknown[] {

        return [
            business.id,
            business.userId,
            business.name ?? "",
            business.address ?? "",
            business.createdAt,
            business.activatedAt ?? "",
            business.isOnboarding,
            business.onboardingCompleted,
            business.status,
        ];
    }


    static toActivation(
        business: Business
    ): unknown[] {

        return [
            business.activatedAt,
            business.status,
            business.isOnboarding,
            business.onboardingCompleted,
        ];
    }
}
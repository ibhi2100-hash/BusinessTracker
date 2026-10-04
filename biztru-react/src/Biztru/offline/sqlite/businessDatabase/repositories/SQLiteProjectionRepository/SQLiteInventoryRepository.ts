// SQLiteInventoryRepository.ts

import type{ Inventory } from "@business/shared-types";

import type{
    IProjectionEntityRepository,
} from "./repositoryContract";

import {
    InventoryStatements,
} from "../../statements/inventory/InventoryStatements";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";

import { inventoryKeys } from "../../statements/inventory/inventoryStatementKeys";


export class SQLiteInventoryRepository
    implements IProjectionEntityRepository<Inventory>
{   private readonly statements: InventoryStatements
    constructor(
        statements: InventoryStatements
    ) {
        this.statements = statements
    }


    // ============================================================
    // TRANSACTION OPERATIONS
    // ============================================================

    upsertOperation(
        state: Inventory
    ): SQLiteStatementOperation {

        return {
            statementKey:
                inventoryKeys.inventoryUpsert,

            params:
                InventoryMapper.toInsert(state),
        };
    }


    deleteOperation(
        id: string
    ): SQLiteStatementOperation {

        return {
            statementKey:
                inventoryKeys.inventoryDelete,

            params: [
                id,
            ],
        };
    }


    // ============================================================
    // IMMEDIATE WRITES
    // ============================================================

    async upsert(
        state: Inventory
    ): Promise<void> {

        if (!state) {
            throw new Error(
                "SQLiteInventoryRepository.upsert received null/undefined"
            );
        }

        await this.statements.upsert.execute(
            InventoryMapper.toInsert(state)
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
    ): Promise<Inventory | null> {

        const rows =
            await this.statements.findById.query<Inventory>([
                id,
            ]);

        return rows[0] ?? null;
    }


    async findProductId(
        productId: string
    ): Promise<Inventory | null> {

        const rows =
            await this.statements.findByProductId.query<Inventory>([
                productId,
            ]);

        return rows[0] ?? null;
    }


    async findAll(): Promise<Inventory[]> {

        return this.statements.update.query<Inventory>([]);
    }
}


// ================================================================
// MAPPER
// ================================================================

export class InventoryMapper {

    static toInsert(
        inventory: Inventory
    ): unknown[] {

        if (!inventory) {
            throw new Error(
                "InventoryMapper.toInsert received null/undefined"
            );
        }

        return [
            inventory.id,
            inventory.productId,
            inventory.branchId ?? null,
            inventory.businessId ?? null,
            inventory.quantity,
            inventory.costPrice,
            inventory.createdAt,
            inventory.updatedAt ?? null,
        ];
    }
}
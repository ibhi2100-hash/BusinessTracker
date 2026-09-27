// SQLiteProductRepository.ts

import { Product } from "@business/shared-types";

import {
    IProjectionEntityRepository,
} from "./repositoryContract";

import {
    ProductStatements,
} from "../../statements/products/ProductStatements";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";
import { productKeys } from "../../statements/products/productStatementKeys";


export interface LiveProduct {

    id: string;

    name: string;

    price: number;

    costPrice: number;

    quantity: number;

    category: string | null;

    imageUrl: string | null;

    isActive: number;

    branchId: string | null;
}


export class SQLiteProductRepository
    implements IProjectionEntityRepository<Product>
{
    constructor(
        private readonly statements: ProductStatements
    ) {}


    // ============================================================
    // TRANSACTION OPERATIONS
    // ============================================================

    upsertOperation(
        state: Product
    ): SQLiteStatementOperation {

        return {
            statementKey:
                productKeys.productUpsert,

            params:
                ProductMapper.toInsert(state),
        };
    }


    deleteOperation(
        id: string
    ): SQLiteStatementOperation {

        return {
            statementKey:
                productKeys.productDelete,

            params: [
                id,
            ],
        };
    }


    // ============================================================
    // IMMEDIATE WRITES
    // ============================================================

    async upsert(
        state: Product
    ): Promise<void> {

        await this.statements.upsert.execute(
            ProductMapper.toInsert(state)
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
    ): Promise<Product | null> {

        const rows =
            await this.statements.findById.query<Product>([
                id,
            ]);

        return rows[0] ?? null;
    }


    async findAll(): Promise<Product[]> {

        return this.statements.update.query<Product>([]);
    }


    async products(
        branchId: string
    ): Promise<LiveProduct[]> {

        return this.statements.products.query<LiveProduct>([
            branchId,
            branchId,
        ]);
    }
}


// ================================================================
// MAPPER
// ================================================================

export class ProductMapper {

    static toInsert(
        product: Product
    ): unknown[] {

        return [

            product.id,

            product.businessId ?? "",

            product.branchId ?? "",

            product.name,

            product.imageUrl ?? "",

            product.description ?? "",

            product.costPrice,

            product.price,

            product.category ?? "",

            product.reorderLevel,

            product.isActive,

            product.isDeleted,

            product.createdAt,

            product.updatedAt ?? "",

            product.deletedAt ?? "",
        ];
    }
}
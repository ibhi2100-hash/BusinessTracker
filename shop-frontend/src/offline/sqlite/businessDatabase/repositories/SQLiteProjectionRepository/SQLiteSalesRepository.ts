// SQLiteSalesRepository.ts

import {
    BuyingAnalysisRow,
    Sales,
} from "@business/shared-types";

import {
    IProjectionEntityRepository,
} from "./repositoryContract";

import {
    SalesStatement,
} from "../../statements/sales/salesStatements";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";

import {
    BuyAnalysisPayload,
} from "@/src/services/ApplicationService/API/Sales/SalesApi";
import { salesKeys } from "../../statements/sales/salesStatementKeys";


export interface SalesListFilters {

    businessId: string;

    branchId?: string | null;

    productId?: string | null;

    from?: string | null;

    to?: string | null;

    status?:
        | "completed"
        | "voided"
        | "refunded"
        | "all";

    limit?: number;

    offset?: number;
}


export interface SalesSummaryRow {

    totalSales: number;

    totalCost: number;

    totalProfit: number;

    totalQuantity: number;

    transactionCount: number;

    voidedCount: number;

    refundedAmount: number;
}


export interface SalesCountRow {
    count: number;
}


export class SQLiteSalesRepository
    implements IProjectionEntityRepository<Sales>
{
    constructor(
        private readonly statements: SalesStatement
    ) {}


    // ============================================================
    // TRANSACTION OPERATIONS
    // ============================================================

    upsertOperation(
        state: Sales
    ): SQLiteStatementOperation {

        return {
            statementKey:
                salesKeys.salesUpsert,

            params:
                SalesMapper.toInsert(state),
        };
    }


    updateOperation(
        state: Sales
    ): SQLiteStatementOperation {

        return {
            statementKey:
                salesKeys.salesUpdate,

            params:
                SalesMapper.toUpdate(state),
        };
    }


    deleteOperation(
        id: string
    ): SQLiteStatementOperation {

        return {
            statementKey:
                salesKeys.salesDelete,

            params: [
                id,
            ],
        };
    }


    // ============================================================
    // IMMEDIATE WRITES
    // ============================================================

    async upsert(
        state: Sales
    ): Promise<void> {

        await this.statements.upsert.execute(
            SalesMapper.toInsert(state)
        );
    }


    async update(
        state: Sales
    ): Promise<void> {

        await this.statements.update.execute(
            SalesMapper.toUpdate(state)
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
    // SINGLE
    // ============================================================

    async findById(
        id: string
    ): Promise<Sales | null> {

        const rows =
            await this.statements.findById.query<Sales>([
                id,
            ]);

        return rows[0] ?? null;
    }


    // ============================================================
    // BASIC READS
    // ============================================================

    async findAll(): Promise<Sales[]> {

        return this.statements.findAll.query<Sales>([]);
    }


    async findByBranch(
        branchId: string
    ): Promise<Sales[]> {

        return this.statements.findByBranch.query<Sales>([
            branchId,
        ]);
    }


    async findByProduct(
        productId: string
    ): Promise<Sales[]> {

        return this.statements.findByProduct.query<Sales>([
            productId,
        ]);
    }


    async findByGroup(
        saleGroupId: string
    ): Promise<Sales[]> {

        return this.statements.findByGroup.query<Sales>([
            saleGroupId,
        ]);
    }


    // ============================================================
    // LIST
    // ============================================================

    async list(
        filters: SalesListFilters
    ): Promise<Sales[]> {

        if (!filters.businessId) {
            throw new Error(
                "Sales list requires businessId"
            );
        }

        const branchId =
            filters.branchId ?? null;

        const productId =
            filters.productId ?? null;

        const from =
            filters.from ?? null;

        const to =
            filters.to ?? null;

        const status =
            filters.status ?? "all";

        const limit =
            Math.min(
                Math.max(
                    Math.floor(filters.limit ?? 100),
                    1
                ),
                500
            );

        const offset =
            Math.max(
                Math.floor(filters.offset ?? 0),
                0
            );

        return this.statements
            .listSales
            .query<Sales>([
                filters.businessId,

                branchId,
                branchId,

                productId,
                productId,

                from,
                from,

                to,
                to,

                status,
                status,

                limit,
                offset,
            ]);
    }


    // ============================================================
    // COUNT
    // ============================================================

    async count(
        filters: Omit<
            SalesListFilters,
            "limit" | "offset"
        >
    ): Promise<number> {

        if (!filters.businessId) {
            throw new Error(
                "Sales count requires businessId"
            );
        }

        const branchId =
            filters.branchId ?? null;

        const productId =
            filters.productId ?? null;

        const from =
            filters.from ?? null;

        const to =
            filters.to ?? null;

        const status =
            filters.status ?? "all";

        const rows =
            await this.statements
                .countSales
                .query<SalesCountRow>([
                    filters.businessId,

                    branchId,
                    branchId,

                    productId,
                    productId,

                    from,
                    from,

                    to,
                    to,

                    status,
                    status,
                ]);

        return Number(
            rows[0]?.count ?? 0
        );
    }


    // ============================================================
    // SUMMARY
    // ============================================================

    async summary(
        filters: {
            from?: string;
            to?: string;
            branchId?: string | null;
        } = {}
    ): Promise<SalesSummaryRow> {

        const from =
            filters.from ??
            "1970-01-01T00:00:00.000Z";

        const to =
            filters.to ??
            "9999-12-31T23:59:59.999Z";

        const branchId =
            filters.branchId ?? null;

        const rows =
            await this.statements
                .summaryByDateRange
                .query<SalesSummaryRow>([
                    from,
                    to,
                    branchId,
                    branchId,
                ]);

        return (
            rows[0] ?? {
                totalSales: 0,
                totalCost: 0,
                totalProfit: 0,
                totalQuantity: 0,
                transactionCount: 0,
                voidedCount: 0,
                refundedAmount: 0,
            }
        );
    }


    // ============================================================
    // INTERNAL
    // ============================================================

    async getAllSales(): Promise<Sales[]> {

        return this.statements
            .allSales
            .query<Sales>([]);
    }


    async getBuyingAnalysis(
        buyAnalysis: BuyAnalysisPayload
    ) {

        return this.statements
            .buyingAnalysis
            .query<BuyingAnalysisRow>([
                buyAnalysis.businessId,
                buyAnalysis.branchId,
                buyAnalysis.currentStart,
                buyAnalysis.currentEnd,
                buyAnalysis.previousStart,
                buyAnalysis.previousEnd,
                buyAnalysis.currentDays,
                buyAnalysis.previousDays,
            ]);
    }
}


// ================================================================
// MAPPER
// ================================================================

export class SalesMapper {

    static toInsert(
        sale: Sales
    ): unknown[] {

        return [

            sale.id,

            sale.businessId ?? "",

            sale.branchId ?? "",

            sale.productId,

            sale.productName ?? "",

            sale.quantity,

            sale.price,

            sale.costPrice,

            sale.unitCostPrice,

            sale.unitPrice,

            sale.total,

            sale.profit ??
                sale.total - sale.costPrice,

            sale.paymentMethod ?? "",

            sale.customerRef ?? "",

            sale.customerId ?? "",

            sale.userId ?? "",

            sale.invoiceId ?? "",

            sale.note ?? "",

            sale.status ?? "completed",

            sale.saleGroupId ?? "",

            sale.mode ?? "LIVE",

            sale.createdAt,

            sale.updatedAt ??
                sale.createdAt,
        ];
    }


    static toUpdate(
        sale: Sales
    ): unknown[] {

        return [

            sale.quantity,

            sale.price,

            sale.costPrice,

            sale.total,

            sale.profit ??
                sale.total - sale.costPrice,

            sale.status ??
                "completed",

            sale.note ?? "",

            sale.updatedAt ??
                Date.now(),

            sale.id,
        ];
    }
}
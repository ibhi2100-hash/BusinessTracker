import {
    Sales,
    SaleStatus,
    PaymentMethod,
    Mode,
} from "@business/shared-types";

import {
    Prisma,
    Sale as PrismaSale,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
    prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";


export interface SalesListFilters {

    branchId?: string | null;

    businessId?: string | null;

    productId?: string;

    from?: Date;

    to?: Date;

    status?: SaleStatus | null;

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


export class SalesRepository {

    constructor(
        private readonly db = prisma
    ) {}


    /*
     * ============================================================
     * UPSERT
     * ============================================================
     *
     * DOMAIN → DATABASE
     * ============================================================
     */

    async upsert(
        state: Sales,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.sale.upsert(
            SalesMapper.toUpsertArgs(state)
        );

    }


    /*
     * ============================================================
     * FIND BY ID
     * ============================================================
     *
     * DATABASE → DOMAIN
     * ============================================================
     */

    async findById(
        id: string
    ): Promise<Sales | null> {

        const row =
            await this.db.sale.findUnique({

                where: {
                    id,
                },

            });

        return row
            ? SalesMapper.fromRow(row)
            : null;

    }


    /*
     * ============================================================
     * FIND ALL
     * ============================================================
     */

    async findAll(): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({

                orderBy: {
                    createdAt: "desc",
                },

            });

        return rows.map(
            SalesMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND BY BRANCH
     * ============================================================
     */

    async findByBranch(
        branchId: string
    ): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({
                where: {
                    branchId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        return rows.map(
            SalesMapper.fromRow
        );
    }


    /*
     * ============================================================
     * FIND BY PRODUCT
     * ============================================================
     */

    async findByProduct(
        productId: string
    ): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({

                where: {
                    productId,
                },

                orderBy: {
                    createdAt: "desc",
                },

            });

        return rows.map(
            SalesMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND CHECKOUT GROUP
     * ============================================================
     */

    async findByGroup(
        saleGroupId: string
    ): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({

                where: {
                    saleGroupId,
                },

                orderBy: {
                    createdAt: "asc",
                },

            });

        return rows.map(
            SalesMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND BY INVOICE
     * ============================================================
     */

    async findByInvoice(
        invoiceId: string
    ): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({

                where: {
                    invoiceId,
                },

                orderBy: {
                    createdAt: "asc",
                },

            });

        return rows.map(
            SalesMapper.fromRow
        );

    }


    /*
     * ============================================================
     * DATE-RANGE LISTING
     * ============================================================
     */

    async list(
        filters: SalesListFilters = {}
    ): Promise<Sales[]> {

        const where:
            Prisma.SaleWhereInput = {};


        if (filters.businessId) {

            where.businessId =
                filters.businessId;

        }


        if (filters.branchId) {

            where.branchId =
                filters.branchId;

        }


        if (filters.productId) {

            where.productId =
                filters.productId;

        }


        if (filters.status) {

            where.status =
                filters.status;

        }


        if (
            filters.from ||
            filters.to
        ) {

            where.createdAt = {};

            if (filters.from) {

                where.createdAt.gte =
                    filters.from;

            }

            if (filters.to) {

                where.createdAt.lte =
                    filters.to;

            }

        }


        const rows =
            await this.db.sale.findMany({

                where,

                orderBy: {
                    createdAt: "desc",
                },

                take:
                    filters.limit ?? 100,

                skip:
                    filters.offset ?? 0,

            });


        return rows.map(
            SalesMapper.fromRow
        );

    }


    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    async summary(
        filters: {
            businessId?: string;
            branchId?: string;
            from?: Date;
            to?: Date;
        } = {}
    ): Promise<SalesSummaryRow> {

        const where:
            Prisma.SaleWhereInput = {};


        if (filters.businessId) {

            where.businessId =
                filters.businessId;

        }


        if (filters.branchId) {

            where.branchId =
                filters.branchId;

        }


        if (
            filters.from ||
            filters.to
        ) {

            where.createdAt = {};

            if (filters.from) {

                where.createdAt.gte =
                    filters.from;

            }

            if (filters.to) {

                where.createdAt.lte =
                    filters.to;

            }

        }


        const rows =
            await this.db.sale.findMany({
                where,
            });


        let totalSales = 0;

        let totalCost = 0;

        let totalProfit = 0;

        let totalQuantity = 0;

        let transactionCount = 0;

        let voidedCount = 0;

        let refundedAmount = 0;


        for (const sale of rows) {

            /*
             * Voided sales do not contribute to
             * revenue, cost, profit, or quantity.
             */

            if (
                sale.status === "voided"
            ) {

                voidedCount++;

                continue;

            }


            totalSales +=
                Number(sale.total);


            totalCost +=
                Number(sale.costPrice);


            totalProfit +=
                Number(sale.profit);


            totalQuantity +=
                Number(sale.quantity);


            transactionCount++;


            /*
             * Refunded sales are included in the
             * transaction count but tracked separately.
             */

            if (
                sale.status === "refunded"
            ) {

                refundedAmount +=
                    Number(sale.total);

            }

        }


        return {

            totalSales,

            totalCost,

            totalProfit,

            totalQuantity,

            transactionCount,

            voidedCount,

            refundedAmount,

        };

    }


    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    async update(
        state: Sales,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.sale.update({

            where: {
                id: state.id,
            },

            data:
                SalesMapper.toUpdate(state),

        });

    }


    /*
     * ============================================================
     * DELETE
     * ============================================================
     *
     * This is a physical delete.
     *
     * In an event-sourced architecture, this should normally
     * happen only as a projection consequence, not as the
     * mechanism for voiding/refunding a sale.
     * ============================================================
     */

    async delete(
        id: string,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.sale.delete({

            where: {
                id,
            },

        });

    }


    /*
     * ============================================================
     * GET ALL SALES
     * ============================================================
     */

    async getAllSales(): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({

                orderBy: {
                    createdAt: "desc",
                },

            });

        return rows.map(
            SalesMapper.fromRow
        );

    }

    async findByBusinessId(
        businessId: string
    ): Promise<Sales[]> {

        const rows =
            await this.db.sale.findMany({
                where: {
                    businessId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        return rows.map(
            SalesMapper.fromRow
        );
    }

    async findByBusinessIdAndBranchId(
        businessId: string,
        branchId: string,
        tx: Prisma.TransactionClient
    ): Promise<Sales[]> {

        const rows =
            await tx.sale.findMany({
                where: {
                    businessId,
                    branchId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        return rows.map(
            SalesMapper.fromRow
        );
    }

}


/*
 * ================================================================
 * SALES MAPPER
 * ================================================================
 *
 * DOMAIN
 *
 * number
 * number
 * Unix milliseconds
 *
 *             ↕
 *
 * DATABASE
 *
 * Prisma.Decimal
 * Date
 *
 * ================================================================
 */

export class SalesMapper {


    /*
     * ============================================================
     * DOMAIN → PRISMA CREATE INPUT
     * ============================================================
     */

    static toCreateInput(
        sale: Sales
    ): Prisma.SaleCreateInput {

        const input: Prisma.SaleCreateInput = {

            id: sale.id,

            business: {
                connect: {
                    id: sale.businessId,
                },
            },

            product: {
                connect: {
                    id_businessId: {
                        id: sale.productId,
                        businessId: sale.businessId,
                    },
                },
            },

            productName:
                sale.productName,

            quantity:
                new Prisma.Decimal(
                    sale.quantity
                ),

            unitCostPrice:
                new Prisma.Decimal(
                    sale.unitCostPrice
                ),

            unitPrice:
                new Prisma.Decimal(
                    sale.unitPrice
                ),

            price:
                new Prisma.Decimal(
                    sale.price
                ),

            costPrice:
                new Prisma.Decimal(
                    sale.costPrice
                ),

            total:
                new Prisma.Decimal(
                    sale.total
                ),

            profit:
                new Prisma.Decimal(
                    sale.profit
                ),

            userId:
                sale.userId,

            customerId:
                sale.customerId,

            customerRef:
                sale.customerRef,

            invoiceId:
                sale.invoiceId,

            paymentMethod:
                sale.paymentMethod,

            note:
                sale.note,

            status:
                sale.status,

            saleGroupId:
                sale.saleGroupId,

            mode:
                sale.mode,

            createdAt:
                new Date(
                    sale.createdAt
                ),
        };

        if (sale.branchId != null) {
            input.branch = {
                connect: {
                    id: sale.branchId,
                },
            };
        }

        return input;
    }

    /*
     * ============================================================
     * DOMAIN → PRISMA UPSERT
     * ============================================================
     */

    static toUpsertArgs(
        sale: Sales
    ): Prisma.SaleUpsertArgs {

        return {

            where: {
                id: sale.id,
            },

            create:
                this.toCreateInput(
                    sale
                ),

            update:
                this.toUpdate(
                    sale
                ),

        };

    }


    /*
     * ============================================================
     * DOMAIN → PRISMA UPDATE
     * ============================================================
     */

    static toUpdate(
        sale: Sales
    ): Prisma.SaleUpdateInput {

        return {

            branch:
                sale.branchId != null
                    ? {
                        connect: {
                            id: sale.branchId,
                        },
                    }
                    : {
                        disconnect: true,
                    },


            productName:
                sale.productName,


            quantity:
                new Prisma.Decimal(
                    sale.quantity
                ),


            unitCostPrice:
                new Prisma.Decimal(
                    sale.unitCostPrice
                ),


            unitPrice:
                new Prisma.Decimal(
                    sale.unitPrice
                ),


            price:
                new Prisma.Decimal(
                    sale.price
                ),


            costPrice:
                new Prisma.Decimal(
                    sale.costPrice
                ),


            total:
                new Prisma.Decimal(
                    sale.total
                ),


            profit:
                new Prisma.Decimal(
                    sale.profit
                ),


            userId:
                sale.userId,


            customerId:
                sale.customerId,


            customerRef:
                sale.customerRef,


            invoiceId:
                sale.invoiceId,


            paymentMethod:
                sale.paymentMethod,


            note:
                sale.note,


            status:
                sale.status,


            saleGroupId:
                sale.saleGroupId,


            mode:
                sale.mode,


            updatedAt:
                sale.updatedAt != null
                    ? new Date(
                        sale.updatedAt
                    )
                    : new Date(),

        };

    }


    /*
     * ============================================================
     * PRISMA → DOMAIN
     * ============================================================
     *
     * Decimal → number
     * Date    → Unix milliseconds
     * ============================================================
     */

    static fromRow(
        row: PrismaSale
    ): Sales {

        return {

            id:
                row.id,


            businessId:
                row.businessId,


            branchId:
                row.branchId,


            productId:
                row.productId,


            productName:
                row.productName,


            quantity:
                Number(
                    row.quantity
                ),


            unitCostPrice:
                Number(
                    row.unitCostPrice
                ),


            unitPrice:
                Number(
                    row.unitPrice
                ),


            price:
                Number(
                    row.price
                ),


            costPrice:
                Number(
                    row.costPrice
                ),


            total:
                Number(
                    row.total
                ),


            profit:
                Number(
                    row.profit
                ),


            userId:
                row.userId,


            customerId:
                row.customerId,


            customerRef:
                row.customerRef,


            invoiceId:
                row.invoiceId,


            paymentMethod:
                row.paymentMethod as PaymentMethod | null,


            note:
                row.note,


            status:
                row.status as SaleStatus,


            saleGroupId:
                row.saleGroupId,


            mode:
                row.mode as Mode,


            createdAt:
                row.createdAt.getTime(),


            updatedAt:
                row.updatedAt != null
                    ? row.updatedAt.getTime()
                    : null,

        };

    }

}
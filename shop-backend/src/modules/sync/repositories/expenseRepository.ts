import {
    Expense,
    ExpenseStatus,
    ExpensePaymentMethod,
    Mode,
} from "@business/shared-types";

import {
    Prisma,
    Expense as PrismaExpense,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
    prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";


/*
 * ================================================================
 * FILTERS
 * ================================================================
 */

export interface ExpenseListFilters {

    branchId?: string | null;

    businessId?: string | null;

    categoryId?: string | null;

    vendorId?: string | null;

    userId?: string | null;

    expenseGroupId?: string | null;

    status?: ExpenseStatus | null;

    from?: Date;

    to?: Date;

    limit?: number;

    offset?: number;
}


/*
 * ================================================================
 * SUMMARY
 * ================================================================
 */

export interface ExpenseSummaryRow {

    totalAmount: number;

    recordedCount: number;

    voidedCount: number;

    reimbursedAmount: number;
}


/*
 * ================================================================
 * REPOSITORY
 * ================================================================
 */

export class ExpenseRepository {

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
        state: Expense,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.expense.upsert(
            ExpenseMapper.toUpsertArgs(state)
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
    ): Promise<Expense | null> {

        const row =
            await this.db.expense.findUnique({

                where: {
                    id,
                },

            });

        return row
            ? ExpenseMapper.fromRow(row)
            : null;

    }


    /*
     * ============================================================
     * FIND ALL
     * ============================================================
     */

    async findAll(): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                orderBy: {
                    incurredAt: "desc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }

    async findByBusinessId(
        businessId: string
    ): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({
                where: {
                    businessId,
                },
                orderBy: {
                    incurredAt: "desc",
                },
            });

        return rows.map(
            ExpenseMapper.fromRow
        );
    }

    async findByBusinessIdAndBranchId(
        businessId: string,
        branchId: string,
        tx: Prisma.TransactionClient
    ): Promise<Expense[]> {

        const rows =
            await tx.expense.findMany({
                where: {
                    businessId,
                    branchId,
                },
                orderBy: {
                    incurredAt: "desc",
                },
            });

        return rows.map(
            ExpenseMapper.fromRow
        );
    }


    /*
     * ============================================================
     * FIND BY BRANCH
     * ============================================================
     */


    /*
     * ============================================================
     * FIND BY CATEGORY
     * ============================================================
     */

    async findByCategory(
        categoryId: string
    ): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                where: {
                    categoryId,
                },

                orderBy: {
                    incurredAt: "desc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND BY VENDOR
     * ============================================================
     */

    async findByVendor(
        vendorId: string
    ): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                where: {
                    vendorId,
                },

                orderBy: {
                    incurredAt: "desc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND BY USER
     * ============================================================
     */

    async findByUser(
        userId: string
    ): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                where: {
                    userId,
                },

                orderBy: {
                    incurredAt: "desc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND EXPENSE GROUP
     * ============================================================
     */

    async findByGroup(
        expenseGroupId: string
    ): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                where: {
                    expenseGroupId,
                },

                orderBy: {
                    incurredAt: "asc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }


    /*
     * ============================================================
     * DATE-RANGE LISTING
     * ============================================================
     *
     * IMPORTANT:
     *
     * Expense reporting should normally use incurredAt,
     * not createdAt.
     *
     * createdAt = when the system recorded it
     * incurredAt = when the economic event happened
     * ============================================================
     */

    async list(
        filters: ExpenseListFilters = {}
    ): Promise<Expense[]> {

        const where:
            Prisma.ExpenseWhereInput = {};


        if (filters.businessId) {

            where.businessId =
                filters.businessId;

        }


        if (filters.branchId) {

            where.branchId =
                filters.branchId;

        }


        if (filters.categoryId) {

            where.categoryId =
                filters.categoryId;

        }


        if (filters.vendorId) {

            where.vendorId =
                filters.vendorId;

        }


        if (filters.userId) {

            where.userId =
                filters.userId;

        }


        if (filters.expenseGroupId) {

            where.expenseGroupId =
                filters.expenseGroupId;

        }


        if (filters.status) {

            where.status =
                filters.status;

        }


        if (
            filters.from ||
            filters.to
        ) {

            where.incurredAt = {};

            if (filters.from) {

                where.incurredAt.gte =
                    filters.from;

            }

            if (filters.to) {

                where.incurredAt.lte =
                    filters.to;

            }

        }


        const rows =
            await this.db.expense.findMany({

                where,

                orderBy: {
                    incurredAt: "desc",
                },

                take:
                    filters.limit ?? 100,

                skip:
                    filters.offset ?? 0,

            });


        return rows.map(
            ExpenseMapper.fromRow
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

            categoryId?: string;

            vendorId?: string;

            from?: Date;

            to?: Date;
        } = {}
    ): Promise<ExpenseSummaryRow> {

        const where:
            Prisma.ExpenseWhereInput = {};


        if (filters.businessId) {

            where.businessId =
                filters.businessId;

        }


        if (filters.branchId) {

            where.branchId =
                filters.branchId;

        }


        if (filters.categoryId) {

            where.categoryId =
                filters.categoryId;

        }


        if (filters.vendorId) {

            where.vendorId =
                filters.vendorId;

        }


        if (
            filters.from ||
            filters.to
        ) {

            where.incurredAt = {};

            if (filters.from) {

                where.incurredAt.gte =
                    filters.from;

            }

            if (filters.to) {

                where.incurredAt.lte =
                    filters.to;

            }

        }


        const rows =
            await this.db.expense.findMany({
                where,
            });


        let totalAmount = 0;

        let recordedCount = 0;

        let voidedCount = 0;

        let reimbursedAmount = 0;


        for (const expense of rows) {

            /*
             * ----------------------------------------------------
             * VOIDED
             * ----------------------------------------------------
             *
             * A voided expense does not contribute to the
             * economic expense total.
             */

            if (
                expense.status === "voided"
            ) {

                voidedCount++;

                continue;

            }


            /*
             * ----------------------------------------------------
             * RECORDED / REIMBURSED
             * ----------------------------------------------------
             */

            totalAmount +=
                Number(expense.amount);


            recordedCount++;


            /*
             * ----------------------------------------------------
             * REIMBURSED
             * ----------------------------------------------------
             */

            if (
                expense.status === "reimbursed"
            ) {

                reimbursedAmount +=
                    Number(expense.amount);

            }

        }


        return {

            totalAmount,

            recordedCount,

            voidedCount,

            reimbursedAmount,

        };

    }


    /*
     * ============================================================
     * CATEGORY SUMMARY
     * ============================================================
     */

    async categorySummary(
        filters: {
            businessId?: string;

            branchId?: string;

            from?: Date;

            to?: Date;
        } = {}
    ): Promise<ExpenseCategorySummaryRow[]> {

        const where:
            Prisma.ExpenseWhereInput = {};


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

            where.incurredAt = {};

            if (filters.from) {

                where.incurredAt.gte =
                    filters.from;

            }

            if (filters.to) {

                where.incurredAt.lte =
                    filters.to;

            }

        }


        const rows =
            await this.db.expense.findMany({
                where,
                orderBy: {
                    incurredAt: "desc",
                },
            });


        const grouped =
            new Map<
                string,
                ExpenseCategorySummaryRow
            >();


        for (const expense of rows) {

            /*
             * Voided expenses are excluded from
             * economic expense reporting.
             */

            if (
                expense.status === "voided"
            ) {

                continue;

            }


            const key =
                expense.categoryId ??
                "__uncategorized__";


            const existing =
                grouped.get(key);


            if (existing) {

                existing.totalAmount +=
                    Number(expense.amount);

                existing.transactionCount++;

                continue;

            }


            grouped.set(
                key,
                {

                    categoryId:
                        expense.categoryId,

                    categoryName:
                        expense.categoryName,

                    totalAmount:
                        Number(expense.amount),

                    transactionCount:
                        1,

                }
            );

        }


        return Array.from(
            grouped.values()
        );

    }


    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    async update(
        state: Expense,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.expense.update({

            where: {
                id: state.id,
            },

            data:
                ExpenseMapper.toUpdate(state),

        });

    }


    /*
     * ============================================================
     * DELETE
     * ============================================================
     *
     * Physical deletion should normally NOT be used to void
     * an expense in an event-sourced system.
     *
     * It exists only for projection maintenance/rebuild cases.
     * ============================================================
     */

    async delete(
        id: string,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.expense.delete({

            where: {
                id,
            },

        });

    }


    /*
     * ============================================================
     * GET ALL EXPENSES
     * ============================================================
     */

    async getAllExpenses(): Promise<Expense[]> {

        const rows =
            await this.db.expense.findMany({

                orderBy: {
                    incurredAt: "desc",
                },

            });

        return rows.map(
            ExpenseMapper.fromRow
        );

    }

}


/*
 * ================================================================
 * CATEGORY SUMMARY TYPE
 * ================================================================
 */

export interface ExpenseCategorySummaryRow {

    categoryId: string | null;

    categoryName: string | null;

    totalAmount: number;

    transactionCount: number;

}


/*
 * ================================================================
 * EXPENSE MAPPER
 * ================================================================
 *
 * DOMAIN
 *
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

export class ExpenseMapper {


    /*
     * ============================================================
     * DOMAIN → PRISMA CREATE INPUT
     * ============================================================
     */

    static toCreateInput(
        expense: Expense
    ): Prisma.ExpenseCreateInput {

        const input:
            Prisma.ExpenseCreateInput = {

            id:
                expense.id,


            business: {
                connect: {
                    id: expense.businessId,
                },
            },


            categoryId:
                expense.categoryId,


            categoryName:
                expense.categoryName,


            title:
                expense.title,


            description:
                expense.description,


            amount:
                new Prisma.Decimal(
                    expense.amount
                ),


            paymentMethod:
                expense.paymentMethod as ExpensePaymentMethod | null,


            vendorId:
                expense.vendorId,


            vendorRef:
                expense.vendorRef,


            userId:
                expense.userId,


            receiptRef:
                expense.receiptRef,


            note:
                expense.note,


            status:
                expense.status,


            expenseGroupId:
                expense.expenseGroupId,


            mode:
                expense.mode,


            incurredAt:
                new Date(
                    expense.incurredAt
                ),


            createdAt:
                new Date(
                    expense.createdAt
                ),

        };


        /*
         * branchId is nullable.
         */

        if (
            expense.branchId != null
        ) {

            input.branch = {

                connect: {
                    id: expense.branchId,
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
        expense: Expense
    ): Prisma.ExpenseUpsertArgs {

        return {

            where: {
                id: expense.id,
            },


            create:
                this.toCreateInput(
                    expense
                ),


            update:
                this.toUpdate(
                    expense
                ),

        };

    }


    /*
     * ============================================================
     * DOMAIN → PRISMA UPDATE
     * ============================================================
     */

    static toUpdate(
        expense: Expense
    ): Prisma.ExpenseUpdateInput {

        return {

            branch:
                expense.branchId != null
                    ? {
                        connect: {
                            id: expense.branchId,
                        },
                    }
                    : {
                        disconnect: true,
                    },


            categoryId:
                expense.categoryId,


            categoryName:
                expense.categoryName,


            title:
                expense.title,


            description:
                expense.description,


            amount:
                new Prisma.Decimal(
                    expense.amount
                ),


            paymentMethod:
                expense.paymentMethod as ExpensePaymentMethod | null,


            vendorId:
                expense.vendorId,


            vendorRef:
                expense.vendorRef,


            userId:
                expense.userId,


            receiptRef:
                expense.receiptRef,


            note:
                expense.note,


            status:
                expense.status,


            expenseGroupId:
                expense.expenseGroupId,


            mode:
                expense.mode,


            incurredAt:
                new Date(
                    expense.incurredAt
                ),


            updatedAt:
                expense.updatedAt != null
                    ? new Date(
                        expense.updatedAt
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
        row: PrismaExpense
    ): Expense {

        return {

            id:
                row.id,


            businessId:
                row.businessId,


            branchId:
                row.branchId,


            categoryId:
                row.categoryId,


            categoryName:
                row.categoryName,


            title:
                row.title,


            description:
                row.description,


            amount:
                Number(
                    row.amount
                ),


            paymentMethod:
                row.paymentMethod as ExpensePaymentMethod | null,


            vendorId:
                row.vendorId,


            vendorRef:
                row.vendorRef,


            userId:
                row.userId,


            receiptRef:
                row.receiptRef,


            note:
                row.note,


            status:
                row.status as ExpenseStatus,


            expenseGroupId:
                row.expenseGroupId,


            mode:
                row.mode as Mode,


            incurredAt:
                row.incurredAt.getTime(),


            createdAt:
                row.createdAt.getTime(),


            updatedAt:
                row.updatedAt != null
                    ? row.updatedAt.getTime()
                    : null,

        };

    }

}

/**
 * repositories/SQLiteProjectionRepository/SQLiteBusinessDashboardRepository.ts
 *
 * Business-wide dashboard repository.
 *
 * All business-level operations are scoped by businessId.
 */

import type { PeriodFilter } from "@business/shared-types";

import { BusinessDashboardStatements } from "../../statements/dashboard/business/BusinessStatements";


/* ================================================================
   RESULT TYPES
   ================================================================ */

export interface BusinessDashboardBalances {
    cash: number;
    bank: number;
    inventoryValue: number;
    liabilities: number;
    ownerCapital: number;
    ownerDrawings: number;
}

export interface BusinessDashboardSummary {
    cash: number;
    bank: number;
    inventoryValue: number;
    liabilities: number;

    branchCount: number;
    activeBranches: number;
    productCount: number;
    employeeCount: number;

    totalInventoryUnits: number;
    stockedProducts: number;
    outOfStockRows: number;

    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;

    todaySales: number;
    salesCount: number;

    businessId: string;
    asOf: number;
}

export interface BusinessDashboardPerformance {
    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
}

export interface BusinessBranchCount {
    branchCount: number;
    activeBranches: number;
    inactiveBranches: number;
}

export interface BusinessInventorySummary {
    stockedProducts: number;
    totalUnits: number;
    outOfStockRows: number;
    inStockRows: number;
}

export interface BusinessBranchPerformance {
    id: string;
    businessId: string;
    name: string;
    location: string;
    phone: string | null;

    isActive: number;
    isDefault: number;
    createdAt: number;

    status: "ACTIVE" | "ATTENTION" | "INACTIVE";
    manager: string;

    cash: number;
    bank: number;
    inventoryValue: number;

    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;

    todaySales: number;
    salesCount: number;

    totalProducts: number;
    totalUnits: number;
    outOfStockRows: number;
}

type BusinessRecord = Record<string, unknown>;


/* ================================================================
   REPOSITORY
   ================================================================ */

export class SQLiteBusinessDashboardRepository {

    private readonly statements: BusinessDashboardStatements;

    constructor(statements: BusinessDashboardStatements) {
        this.statements = statements;
    }


    /* ============================================================
       FINANCIAL DASHBOARD
       ============================================================ */


    /**
     * Get all-time business account balances.
     */
    async getBalances(
        businessId: string
    ): Promise<BusinessDashboardBalances> {

        const rows = await this.statements.balances.query<BusinessDashboardBalances>([
            businessId,
        ]);

        return rows[0] ?? {
            cash: 0,
            bank: 0,
            inventoryValue: 0,
            liabilities: 0,
            ownerCapital: 0,
            ownerDrawings: 0,
        };
    }


    /**
     * Get consolidated business dashboard summary.
     *
     * Combines:
     * - Business-wide balances and structure
     * - Period financial performance
     * - Today's sales
     */
    async getSummary(
        businessId: string,
        period?: PeriodFilter
    ): Promise<BusinessDashboardSummary> {

        const now = Date.now();

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? now;

        const todayFrom = this.startOfToday();

        const [
            summaryRows,
            performance,
            todaySalesRows,
        ] = await Promise.all([

            this.statements.summary.query<{
                cash: number;
                bank: number;
                inventoryValue: number;
                liabilities: number;

                branchCount: number;
                activeBranches: number;
                productCount: number;
                employeeCount: number;

                totalInventoryUnits: number;
                stockedProducts: number;
                outOfStockRows: number;
            }>([
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
                businessId,
            ]),

            this.getPerformance(businessId, {
                from,
                to,
            }),

            this.statements.todaySales.query<{
                todaySales: number;
                salesCount: number;
            }>([
                businessId,
                todayFrom,
                now,
            ]),
        ]);

        const summary = summaryRows[0];

        const today = todaySalesRows[0];

        return {
            cash: summary?.cash ?? 0,
            bank: summary?.bank ?? 0,
            inventoryValue: summary?.inventoryValue ?? 0,
            liabilities: summary?.liabilities ?? 0,

            branchCount: summary?.branchCount ?? 0,
            activeBranches: summary?.activeBranches ?? 0,
            productCount: summary?.productCount ?? 0,
            employeeCount: summary?.employeeCount ?? 0,

            totalInventoryUnits: summary?.totalInventoryUnits ?? 0,
            stockedProducts: summary?.stockedProducts ?? 0,
            outOfStockRows: summary?.outOfStockRows ?? 0,

            revenue: performance.revenue,
            cogs: performance.cogs,
            expenses: performance.expenses,
            grossProfit: performance.grossProfit,
            netProfit: performance.netProfit,

            todaySales: today?.todaySales ?? 0,
            salesCount: today?.salesCount ?? 0,

            businessId,
            asOf: now,
        };
    }


    /**
     * Get business revenue for a reporting period.
     */
    async getRevenue(
        businessId: string,
        period?: PeriodFilter
    ): Promise<number> {

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? Date.now();

        const rows = await this.statements.revenue.query<{
            revenue: number;
        }>([
            businessId,
            from,
            to,
        ]);

        return rows[0]?.revenue ?? 0;
    }


    /**
     * Get business cost of goods sold.
     */
    async getCogs(
        businessId: string,
        period?: PeriodFilter
    ): Promise<number> {

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? Date.now();

        const rows = await this.statements.cogs.query<{
            cogs: number;
        }>([
            businessId,
            from,
            to,
        ]);

        return rows[0]?.cogs ?? 0;
    }


    /**
     * Get business operating expenses.
     */
    async getExpenses(
        businessId: string,
        period?: PeriodFilter
    ): Promise<number> {

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? Date.now();

        const rows = await this.statements.expenses.query<{
            expenses: number;
        }>([
            businessId,
            from,
            to,
        ]);

        return rows[0]?.expenses ?? 0;
    }


    /**
     * Get business revenue generated today.
     */
    async getTodaySales(
        businessId: string
    ): Promise<number> {

        const now = Date.now();
        const from = this.startOfToday();

        const rows = await this.statements.todaySales.query<{
            todaySales: number;
            salesCount: number;
        }>([
            businessId,
            from,
            now,
        ]);

        return rows[0]?.todaySales ?? 0;
    }


    /**
     * Get complete business financial performance.
     */
    async getPerformance(
        businessId: string,
        period?: PeriodFilter
    ): Promise<BusinessDashboardPerformance> {

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? Date.now();

        const rows = await this.statements.performance.query<BusinessDashboardPerformance>([
            businessId,
            from,
            to,
        ]);

        return rows[0] ?? {
            revenue: 0,
            cogs: 0,
            expenses: 0,
            grossProfit: 0,
            netProfit: 0,
        };
    }


    /* ============================================================
       BUSINESS STRUCTURE
       ============================================================ */


    /**
     * Get branch count and activation statistics.
     */
    async getBranchCount(
        businessId: string
    ): Promise<BusinessBranchCount> {

        const rows = await this.statements.branchCount.query<BusinessBranchCount>([
            businessId,
        ]);

        return rows[0] ?? {
            branchCount: 0,
            activeBranches: 0,
            inactiveBranches: 0,
        };
    }


    /**
     * Get total business product count.
     */
    async getProductCount(
        businessId: string
    ): Promise<number> {

        const rows = await this.statements.productCount.query<{
            productCount: number;
        }>([
            businessId,
        ]);

        return rows[0]?.productCount ?? 0;
    }


    /**
     * Get consolidated inventory statistics.
     */
    async getInventorySummary(
        businessId: string
    ): Promise<BusinessInventorySummary> {

        const rows = await this.statements.inventory.query<BusinessInventorySummary>([
            businessId,
        ]);

        return rows[0] ?? {
            stockedProducts: 0,
            totalUnits: 0,
            outOfStockRows: 0,
            inStockRows: 0,
        };
    }


    /**
     * Get performance of every branch belonging to the business.
     */
    async getBranchPerformance(
        businessId: string,
        period?: PeriodFilter
    ): Promise<BusinessBranchPerformance[]> {

        const now = Date.now();

        const from = period?.from ?? this.startOfToday();
        const to = period?.to ?? now;

        const todayFrom = this.startOfToday();

        return this.statements.branchPerformance.query<BusinessBranchPerformance>([
            from,
            to,
            from,
            to,
            from,
            to,
            todayFrom,
            now,
            todayFrom,
            now,
            businessId,
            businessId,
            businessId,
            businessId,
        ]);
    }


    /* ============================================================
       BUSINESS INFORMATION
       ============================================================ */


    /**
     * Get business profile.
     */
    async getProfile(
        businessId: string
    ): Promise<BusinessRecord | null> {

        const rows = await this.statements.profile.query<BusinessRecord>([
            businessId,
        ]);

        return rows[0] ?? null;
    }


    /**
     * Get all business branches.
     */
    async getBranches(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.branches.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business products.
     */
    async getProducts(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.products.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all inventory records across business branches.
     */
    async getAllInventory(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.allInventory.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business employees.
     */
    async getEmployees(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.employees.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business customers.
     */
    async getCustomers(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.customers.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business suppliers.
     */
    async getSuppliers(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.suppliers.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business sales.
     */
    async getSales(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.sales.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business ledger entries.
     */
    async getLedger(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.ledger.query<BusinessRecord>([
            businessId,
        ]);
    }


    /**
     * Get all business expense records.
     */
    async getAllExpenses(
        businessId: string
    ): Promise<BusinessRecord[]> {

        return this.statements.allExpenses.query<BusinessRecord>([
            businessId,
        ]);
    }


    /* ============================================================
       DATE HELPERS
       ============================================================ */

    private startOfToday(): number {
        const date = new Date();

        date.setHours(0, 0, 0, 0);

        return date.getTime();
    }
}


import { BusinessManager } from "../../../../Composer/BusinessManager";
import type { PeriodFilter } from "@business/shared-types";

export class BusinessDashboardApi {
    private readonly manager: BusinessManager;

    constructor(manager: BusinessManager) {
        this.manager = manager;
    }

    private async getRepository() {
        const app = await this.manager.current();

        if (!app) {
            throw new Error(
                "Business does not exist in BusinessDashboardApi"
            );
        }

        return app.storage.repositories.businessDashboard;
    }

    /* ============================================================
       FINANCIAL DASHBOARD
       ============================================================ */

    async getSummary(businessId: string, period?: PeriodFilter) {
        const repository = await this.getRepository();

        return repository.getSummary(businessId, period);
    }

    async getBalances(businessId: string) {
        const repository = await this.getRepository();

        return repository.getBalances(businessId);
    }

    async getRevenue(businessId: string, period?: PeriodFilter) {
        const repository = await this.getRepository();

        return repository.getRevenue(businessId, period);
    }

    async getCogs(businessId: string, period?: PeriodFilter) {
        const repository = await this.getRepository();

        return repository.getCogs(businessId, period);
    }

    async getExpenses(businessId: string, period?: PeriodFilter) {
        const repository = await this.getRepository();

        return repository.getExpenses(businessId, period);
    }

    async getTodaySales(businessId: string) {
        const repository = await this.getRepository();

        return repository.getTodaySales(businessId);
    }

    async getPerformance(businessId: string, period?: PeriodFilter) {
        const repository = await this.getRepository();

        return repository.getPerformance(businessId, period);
    }

    /* ============================================================
       BUSINESS STRUCTURE
       ============================================================ */

    async getBranchCount(businessId: string) {
        const repository = await this.getRepository();

        return repository.getBranchCount(businessId);
    }

    async getProductCount(businessId: string) {
        const repository = await this.getRepository();

        return repository.getProductCount(businessId);
    }

    async getInventorySummary(businessId: string) {
        const repository = await this.getRepository();

        return repository.getInventorySummary(businessId);
    }

    async getBranchPerformance(
        businessId: string,
        period?: PeriodFilter
    ) {
        const repository = await this.getRepository();

        return repository.getBranchPerformance(businessId, period);
    }

    /* ============================================================
       BUSINESS PROFILE
       ============================================================ */

    async getProfile(businessId: string) {
        const repository = await this.getRepository();

        return repository.getProfile(businessId);
    }

    /* ============================================================
       BUSINESS BRANCHES
       ============================================================ */

    async getBranches(businessId: string) {
        const repository = await this.getRepository();

        return repository.getBranches(businessId);
    }

    /* ============================================================
       BUSINESS PRODUCTS
       ============================================================ */

    async getProducts(businessId: string) {
        const repository = await this.getRepository();

        return repository.getProducts(businessId);
    }

    /* ============================================================
       BUSINESS INVENTORY
       ============================================================ */

    async getAllInventory(businessId: string) {
        const repository = await this.getRepository();

        return repository.getAllInventory(businessId);
    }

    /* ============================================================
       BUSINESS EMPLOYEES
       ============================================================ */

    async getEmployees(businessId: string) {
        const repository = await this.getRepository();

        return repository.getEmployees(businessId);
    }

    /* ============================================================
       BUSINESS CUSTOMERS
       ============================================================ */

    async getCustomers(businessId: string) {
        const repository = await this.getRepository();

        return repository.getCustomers(businessId);
    }

    /* ============================================================
       BUSINESS SUPPLIERS
       ============================================================ */

    async getSuppliers(businessId: string) {
        const repository = await this.getRepository();

        return repository.getSuppliers(businessId);
    }

    /* ============================================================
       BUSINESS SALES
       ============================================================ */

    async getSales(businessId: string) {
        const repository = await this.getRepository();

        return repository.getSales(businessId);
    }

    /* ============================================================
       BUSINESS LEDGER
       ============================================================ */

    async getLedger(businessId: string) {
        const repository = await this.getRepository();

        return repository.getLedger(businessId);
    }

    /* ============================================================
       BUSINESS EXPENSES
       ============================================================ */

    async getAllExpenses(businessId: string) {
        const repository = await this.getRepository();

        return repository.getAllExpenses(businessId);
    }
}

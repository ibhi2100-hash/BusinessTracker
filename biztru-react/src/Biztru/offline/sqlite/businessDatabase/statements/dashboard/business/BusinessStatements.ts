
// statements/dashboard/BusinessDashboardStatements.ts

import type { PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";

import { businessDashboardKeys } from "./dashboardStatementsKeys";

export class BusinessDashboardStatements {
    private readonly manager: PreparedStatementManager;

    constructor(manager: PreparedStatementManager) {
        this.manager = manager;
    }

    /* ================================================================
       FINANCIAL DASHBOARD
       ================================================================ */

    get balances() {
        return this.manager.get(businessDashboardKeys.balances);
    }

    get revenue() {
        return this.manager.get(businessDashboardKeys.revenue);
    }

    get cogs() {
        return this.manager.get(businessDashboardKeys.cogs);
    }

    get expenses() {
        return this.manager.get(businessDashboardKeys.expenses);
    }

    get todaySales() {
        return this.manager.get(businessDashboardKeys.todaySales);
    }

    get branchCount() {
        return this.manager.get(businessDashboardKeys.branchCount);
    }

    get productCount() {
        return this.manager.get(businessDashboardKeys.productCount);
    }

    get inventory() {
        return this.manager.get(businessDashboardKeys.inventory);
    }

    get branchPerformance() {
        return this.manager.get(businessDashboardKeys.branchPerformance);
    }

    get summary() {
        return this.manager.get(businessDashboardKeys.summary);
    }

    /* ================================================================
       BUSINESS INFORMATION
       ================================================================ */

    get profile() {
        return this.manager.get(businessDashboardKeys.profile);
    }

    get branches() {
        return this.manager.get(businessDashboardKeys.branches);
    }

    get products() {
        return this.manager.get(businessDashboardKeys.products);
    }

    get allInventory() {
        return this.manager.get(businessDashboardKeys.allInventory);
    }

    get employees() {
        return this.manager.get(businessDashboardKeys.employees);
    }

    get customers() {
        return this.manager.get(businessDashboardKeys.customers);
    }

    get suppliers() {
        return this.manager.get(businessDashboardKeys.suppliers);
    }

    get sales() {
        return this.manager.get(businessDashboardKeys.sales);
    }

    get ledger() {
        return this.manager.get(businessDashboardKeys.ledger);
    }

    get allExpenses() {
        return this.manager.get(businessDashboardKeys.allExpenses);
    }

    get performance() {
        return this.manager.get(businessDashboardKeys.performance);
    }
}

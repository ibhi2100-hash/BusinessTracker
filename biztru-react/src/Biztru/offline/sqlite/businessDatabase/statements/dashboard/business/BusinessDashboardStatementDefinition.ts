
import type {
  StatementDefinition,
} from "../../../../PreparedStatement/StatementRegistry/statementDefinition";

import * as SQL from "./sql";
import * as BUSINESS_SQL from "./sql";

import { businessDashboardKeys } from "./dashboardStatementsKeys";

export const BusinessDashboardStatementDefinition: StatementDefinition[] = [
  /* ================================================================
     FINANCIAL DASHBOARD
     ================================================================ */

  {
    key: businessDashboardKeys.balances,
    sql: SQL.BUSINESS_DASHBOARD_BALANCES,
  },
  {
    key: businessDashboardKeys.revenue,
    sql: SQL.BUSINESS_DASHBOARD_REVENUE,
  },
  {
    key: businessDashboardKeys.cogs,
    sql: SQL.BUSINESS_DASHBOARD_COGS,
  },
  {
    key: businessDashboardKeys.expenses,
    sql: SQL.BUSINESS_DASHBOARD_EXPENSES,
  },
  {
    key: businessDashboardKeys.todaySales,
    sql: SQL.BUSINESS_DASHBOARD_TODAY_SALES,
  },
  {
    key: businessDashboardKeys.branchCount,
    sql: SQL.BUSINESS_DASHBOARD_BRANCH_COUNT,
  },
  {
    key: businessDashboardKeys.productCount,
    sql: SQL.BUSINESS_DASHBOARD_PRODUCT_COUNT,
  },
  {
    key: businessDashboardKeys.inventory,
    sql: SQL.BUSINESS_DASHBOARD_INVENTORY,
  },
  {
    key: businessDashboardKeys.summary,
    sql: SQL.BUSINESS_DASHBOARD_SUMMARY,
  },

  /* ================================================================
     BUSINESS INFORMATION
     ================================================================ */

  {
    key: businessDashboardKeys.profile,
    sql: BUSINESS_SQL.BUSINESS_PROFILE,
  },
  {
    key: businessDashboardKeys.branches,
    sql: BUSINESS_SQL.BUSINESS_BRANCHES,
  },
  {
    key: businessDashboardKeys.products,
    sql: BUSINESS_SQL.BUSINESS_PRODUCTS,
  },
  {
    key: businessDashboardKeys.allInventory,
    sql: BUSINESS_SQL.BUSINESS_INVENTORY,
  },
  {
    key: businessDashboardKeys.employees,
    sql: BUSINESS_SQL.BUSINESS_EMPLOYEES,
  },
  {
    key: businessDashboardKeys.customers,
    sql: BUSINESS_SQL.BUSINESS_CUSTOMERS,
  },
  {
    key: businessDashboardKeys.suppliers,
    sql: BUSINESS_SQL.BUSINESS_SUPPLIERS,
  },
  {
    key: businessDashboardKeys.sales,
    sql: BUSINESS_SQL.BUSINESS_SALES,
  },
  {
    key: businessDashboardKeys.ledger,
    sql: BUSINESS_SQL.BUSINESS_LEDGER,
  },
  {
    key: businessDashboardKeys.allExpenses,
    sql: BUSINESS_SQL.BUSINESS_EXPENSES,
  },

  {
    key: businessDashboardKeys.branchPerformance,
    sql: BUSINESS_SQL.BUSINESS_BRANCH_PERFORMANCE,
  },

  {
    key: businessDashboardKeys.performance,
    sql: BUSINESS_SQL.BUSINESS_PERFORMANCE,
  }
];
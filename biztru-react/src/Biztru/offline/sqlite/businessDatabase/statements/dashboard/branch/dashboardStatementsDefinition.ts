
import type { StatementDefinition } from "../../../../PreparedStatement/StatementRegistry/statementDefinition";
import * as SQL from "./sql";
import { branchDashboardKeys } from "./dashbordStatementKeys";

export const BranchDashboardStatementDefinition: StatementDefinition[] = [
  {
    key: branchDashboardKeys.balances,
    sql: SQL.BRANCH_DASHBOARD_BALANCES,
  },
  {
    key: branchDashboardKeys.revenue,
    sql: SQL.BRANCH_DASHBOARD_REVENUE,
  },
  {
    key: branchDashboardKeys.cogs,
    sql: SQL.BRANCH_DASHBOARD_COGS,
  },
  {
    key: branchDashboardKeys.expenses,
    sql: SQL.BRANCH_DASHBOARD_EXPENSES,
  },
  {
    key: branchDashboardKeys.todaySales,
    sql: SQL.BRANCH_DASHBOARD_TODAY_SALES,
  },
  {
    key: branchDashboardKeys.inventory,
    sql: SQL.BRANCH_DASHBOARD_INVENTORY,
  },
  {
    key: branchDashboardKeys.productCount,
    sql: SQL.BRANCH_DASHBOARD_PRODUCT_COUNT,
  },
  {
    key: branchDashboardKeys.summary,
    sql: SQL.BRANCH_DASHBOARD_SUMMARY,
  },
];

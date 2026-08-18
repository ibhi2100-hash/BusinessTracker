// statements/dashboard/DashboardStatementDefinition.ts
import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { dashboardKeys } from "./dashbordStatementKeys";

export const DashboardStatementDefinition: StatementDefinition[] = [
  { key: dashboardKeys.balances,        sql: SQL.DASHBOARD_BALANCES },
  { key: dashboardKeys.revenue,         sql: SQL.DASHBOARD_REVENUE },
  { key: dashboardKeys.cogs,            sql: SQL.DASHBOARD_COGS },
  { key: dashboardKeys.expenses,        sql: SQL.DASHBOARD_EXPENSES },
  { key: dashboardKeys.todaySales,      sql: SQL.DASHBOARD_TODAY_SALES },
  { key: dashboardKeys.summary,         sql: SQL.DASHBOARD_SUMMARY },
];
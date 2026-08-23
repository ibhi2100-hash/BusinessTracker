// statements/report/ReportStatementDefinition.ts

import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { reportKeys } from "./reportKeys";

export const ReportStatementDefinition: StatementDefinition[] = [
  { key: reportKeys.periodSummary, sql: SQL.REPORT_PERIOD_SUMMARY },
  { key: reportKeys.monthlyBreakdown, sql: SQL.REPORT_MONTHLY_BREAKDOWN },
  { key: reportKeys.yearlyBreakdown, sql: SQL.REPORT_YEARLY_BREAKDOWN },
  { key: reportKeys.periodRevenue, sql: SQL.REPORT_PERIOD_REVENUE },
  { key: reportKeys.periodCogs, sql: SQL.REPORT_PERIOD_COGS },
  { key: reportKeys.periodExpenses, sql: SQL.REPORT_PERIOD_EXPENSES },
  { key: reportKeys.todaySales, sql: SQL.REPORT_TODAY_SALES },
  { key: reportKeys.todayProfit, sql: SQL.REPORT_TODAY_PROFIT },
  { key: reportKeys.balances, sql: SQL.REPORT_BALANCES },
];
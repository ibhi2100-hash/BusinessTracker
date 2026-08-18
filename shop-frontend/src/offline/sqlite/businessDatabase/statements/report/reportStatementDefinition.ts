// statements/report/ReportStatementDefinition.ts

import * as SQL from "./sql";
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { reportKeys } from "./reportKeys";

export const ReportStatementDefinition: StatementDefinition[] = [
  { key: reportKeys.periodSummary,    sql: SQL.REPORT_PERIOD_SUMMARY },
  { key: reportKeys.monthlyBreakdown, sql: SQL.REPORT_MONTHLY_BREAKDOWN },
  { key: reportKeys.yearlyBreakdown,  sql: SQL.REPORT_YEARLY_BREAKDOWN },
];
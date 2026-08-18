// statements/report/ReportStatements.ts

import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { reportKeys } from "./reportKeys";

export class ReportStatements {
  constructor(private readonly manager: PreparedStatementManager) {}

  get periodSummary()    { return this.manager.get(reportKeys.periodSummary); }
  get monthlyBreakdown() { return this.manager.get(reportKeys.monthlyBreakdown); }
  get yearlyBreakdown()  { return this.manager.get(reportKeys.yearlyBreakdown); }
}
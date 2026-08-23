// statements/report/ReportStatements.ts

import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { reportKeys } from "./reportKeys";

export class ReportStatements {
  constructor(private readonly manager: PreparedStatementManager) {}

  get periodSummary() {
    return this.manager.get(reportKeys.periodSummary);
  }

  get monthlyBreakdown() {
    return this.manager.get(reportKeys.monthlyBreakdown);
  }

  get yearlyBreakdown() {
    return this.manager.get(reportKeys.yearlyBreakdown);
  }

  get periodRevenue() {
    return this.manager.get(reportKeys.periodRevenue);
  }

  get periodCogs() {
    return this.manager.get(reportKeys.periodCogs);
  }

  get periodExpenses() {
    return this.manager.get(reportKeys.periodExpenses);
  }

  get todaySales() {
    return this.manager.get(reportKeys.todaySales);
  }

  get todayProfit() {
    return this.manager.get(reportKeys.todayProfit);
  }

  get balances() {
    return this.manager.get(reportKeys.balances);
  }
}
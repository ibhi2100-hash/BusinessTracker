// statements/dashboard/DashboardStatements.ts
import type{ PreparedStatementManager } from "../../../../PreparedStatement/PreparedStatementManager";
import { branchDashboardKeys } from "./dashbordStatementKeys";
export class DashboardStatements {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get balances()   { return this.manager.get(branchDashboardKeys.balances); }
  get revenue()    { return this.manager.get(branchDashboardKeys.revenue); }
  get cogs()       { return this.manager.get(branchDashboardKeys.cogs); }
  get expenses()   { return this.manager.get(branchDashboardKeys.expenses); }
  get todaySales() { return this.manager.get(branchDashboardKeys.todaySales); }
  get summary()    { return this.manager.get(branchDashboardKeys.summary); }
}
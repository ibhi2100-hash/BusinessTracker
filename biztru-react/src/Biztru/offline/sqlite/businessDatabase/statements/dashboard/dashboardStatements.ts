// statements/dashboard/DashboardStatements.ts
import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { dashboardKeys } from "./dashbordStatementKeys";
export class DashboardStatements {
  private readonly manager: PreparedStatementManager;
  constructor(manager: PreparedStatementManager) {
    this.manager = manager
  }

  get balances()   { return this.manager.get(dashboardKeys.balances); }
  get revenue()    { return this.manager.get(dashboardKeys.revenue); }
  get cogs()       { return this.manager.get(dashboardKeys.cogs); }
  get expenses()   { return this.manager.get(dashboardKeys.expenses); }
  get todaySales() { return this.manager.get(dashboardKeys.todaySales); }
  get summary()    { return this.manager.get(dashboardKeys.summary); }
}
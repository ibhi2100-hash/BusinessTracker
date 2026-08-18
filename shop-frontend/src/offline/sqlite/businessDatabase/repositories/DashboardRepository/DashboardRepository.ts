// repositories/SQLiteProjectionRepository/SQLiteDashboardRepository.ts
import { DashboardRepository } from "./DashboardRepositoryContracts";
import { DashboardSummary, PeriodFilter } from "@business/shared-types";
import { DashboardStatements } from "../../statements/dashboard/dashboardStatements";


export class SQLiteDashboardRepository implements DashboardRepository {
  constructor(private readonly statements: DashboardStatements) {}

  async getSummary(
    branchId: string,
    period?: PeriodFilter
  ): Promise<DashboardSummary> {
    const now = Date.now();
    const from = period?.from ?? this.startOfToday();
    const to   = period?.to   ?? now;

    const rows = await this.statements.summary.query<{
      cash: number;
      bank: number;
      inventoryValue: number;
      liabilities: number;
      ownerCapital: number;
      ownerDrawings: number;
      revenue: number;
      cogs: number;
      expenses: number;
    }>([branchId, branchId, from, to]);

    const row = rows[0] ?? {
      cash: 0, bank: 0, inventoryValue: 0,
      liabilities: 0, ownerCapital: 0, ownerDrawings: 0,
      revenue: 0, cogs: 0, expenses: 0
    };

    const grossProfit = row.revenue - row.cogs;
    const netProfit   = grossProfit - row.expenses;

    // Today sales (always last 24h or calendar day)
    const todayFrom = this.startOfToday();
    const todaySalesRows = await this.statements.todaySales.query<{ total: number }>([
      branchId, todayFrom, now
    ]);
    const todaySales = todaySalesRows[0]?.total ?? 0;

    return {
      cash: row.cash,
      bank: row.bank,
      inventoryValue: row.inventoryValue,
      liabilities: row.liabilities,
      revenue: row.revenue,
      cogs: row.cogs,
      expenses: row.expenses,
      grossProfit,
      netProfit,
      todaySales,
      todayProfit: todaySales - (/* you can add today COGS/expenses if needed */ 0),
      branchId,
      asOf: now,
    };
  }

  async getTodaySales(branchId: string): Promise<number> {
    const now = Date.now();
    const from = this.startOfToday();
    const rows = await this.statements.todaySales.query<{ total: number }>([
      branchId, from, now
    ]);
    return rows[0]?.total ?? 0;
  }

  async getRevenue(branchId: string, period?: PeriodFilter): Promise<number> {
    const from = period?.from ?? this.startOfToday();
    const to   = period?.to   ?? Date.now();
    const rows = await this.statements.revenue.query<{ total: number }>([
      branchId, from, to
    ]);
    return rows[0]?.total ?? 0;
  }

  async getExpenses(branchId: string, period?: PeriodFilter): Promise<number> {
    const from = period?.from ?? this.startOfToday();
    const to   = period?.to   ?? Date.now();
    const rows = await this.statements.expenses.query<{ total: number }>([
      branchId, from, to
    ]);
    return rows[0]?.total ?? 0;
  }

  // Helper
  private startOfToday(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
}
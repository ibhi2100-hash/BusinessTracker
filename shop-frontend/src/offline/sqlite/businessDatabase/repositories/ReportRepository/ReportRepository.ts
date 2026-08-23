// repositories/SQLiteProjectionRepository/SQLiteReportRepository.ts

import { ReportRepository, ReportBalances } from "./ReportRepositoryContract";
import { ReportStatements } from "../../statements/report/reportStatements";
import {
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
  PeriodFilter,
  DashboardSummary,
} from "@business/shared-types";

export class SQLiteReportRepository implements ReportRepository {
  constructor(private readonly statements: ReportStatements) {}

  async getPeriodSummary(
    branchId: string,
    period: PeriodFilter
  ): Promise<ReportSummary> {
    const rows = await this.statements.periodSummary.query<{
      cash: number;
      bank: number;
      inventoryValue: number;
      liabilities: number;
      ownerCapital: number;
      ownerDrawings: number;
      revenue: number;
      cogs: number;
      expenses: number;
    }>([branchId, branchId, period.from, period.to]);

    const row = rows[0] ?? {
      cash: 0,
      bank: 0,
      inventoryValue: 0,
      liabilities: 0,
      ownerCapital: 0,
      ownerDrawings: 0,
      revenue: 0,
      cogs: 0,
      expenses: 0,
    };

    const grossProfit = row.revenue - row.cogs;
    const netProfit = grossProfit - row.expenses;

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
      todaySales: 0,
      todayProfit: 0,
      branchId,
      asOf: Date.now(),
      period,
      previousPeriod: null,
      delta: null,
    };
  }

  async getMonthlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<MonthlyRow[]> {
    const rows = await this.statements.monthlyBreakdown.query<{
      month: string;
      revenue: number;
      cogs: number;
      expenses: number;
    }>([branchId, from, to]);

    return rows.map((r) => {
      const grossProfit = r.revenue - r.cogs;
      return {
        month: r.month,
        revenue: r.revenue,
        cogs: r.cogs,
        expenses: r.expenses,
        grossProfit,
        netProfit: grossProfit - r.expenses,
      };
    });
  }

  async getYearlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<YearlyRow[]> {
    const rows = await this.statements.yearlyBreakdown.query<{
      year: number;
      revenue: number;
      cogs: number;
      expenses: number;
    }>([branchId, from, to]);

    return rows.map((r) => {
      const grossProfit = r.revenue - r.cogs;
      return {
        year: r.year,
        revenue: r.revenue,
        cogs: r.cogs,
        expenses: r.expenses,
        grossProfit,
        netProfit: grossProfit - r.expenses,
      };
    });
  }

  async getComparison(
    branchId: string,
    current: PeriodFilter,
    previous: PeriodFilter
  ): Promise<ComparisonResult> {
    const [currentSummary, previousSummary] = await Promise.all([
      this.getPeriodSummary(branchId, current),
      this.getPeriodSummary(branchId, previous),
    ]);

    const delta = {
      revenue: currentSummary.revenue - previousSummary.revenue,
      cogs: currentSummary.cogs - previousSummary.cogs,
      expenses: currentSummary.expenses - previousSummary.expenses,
      grossProfit: currentSummary.grossProfit - previousSummary.grossProfit,
      netProfit: currentSummary.netProfit - previousSummary.netProfit,
    };

    return {
      current: {
        ...currentSummary,
        previousPeriod: previousSummary,
        delta,
      },
      previous: previousSummary,
      delta,
    };
  }

  async getPeriodRevenue(
    branchId: string,
    period: PeriodFilter
  ): Promise<number> {
    const rows = await this.statements.periodRevenue.query<{ value: number }>([
      branchId,
      period.from,
      period.to,
    ]);
    return rows[0]?.value ?? 0;
  }

  async getPeriodCogs(
    branchId: string,
    period: PeriodFilter
  ): Promise<number> {
    const rows = await this.statements.periodCogs.query<{ value: number }>([
      branchId,
      period.from,
      period.to,
    ]);
    return rows[0]?.value ?? 0;
  }

  async getPeriodExpenses(
    branchId: string,
    period: PeriodFilter
  ): Promise<number> {
    const rows = await this.statements.periodExpenses.query<{ value: number }>([
      branchId,
      period.from,
      period.to,
    ]);
    return rows[0]?.value ?? 0;
  }

  async getTodaySales(
    branchId: string,
    from: number,
    to: number
  ): Promise<number> {
    const rows = await this.statements.todaySales.query<{ value: number }>([
      branchId,
      from,
      to,
    ]);
    return rows[0]?.value ?? 0;
  }

  async getTodayProfit(
    branchId: string,
    from: number,
    to: number
  ): Promise<number> {
    const rows = await this.statements.todayProfit.query<{ value: number }>([
      branchId,
      from,
      to,
    ]);
    return rows[0]?.value ?? 0;
  }

  async getBalances(branchId: string): Promise<ReportBalances> {
    const rows = await this.statements.balances.query<{
      account: string;
      balance: number;
    }>([branchId]);

    const map = Object.fromEntries(
      rows.map((r) => [r.account, r.balance])
    ) as Record<string, number>;

    return {
      cash: map.CASH ?? 0,
      bank: map.BANK ?? 0,
      inventoryValue: map.INVENTORY ?? 0,
      liabilities: map.LIABILITIES ?? 0,
      ownerCapital: map.OWNER_CAPITAL ?? 0,
      ownerDrawings: map.OWNER_DRAWINGS ?? 0,
    };
  }

  async getDashboard(
    branchId: string,
    today: PeriodFilter
  ): Promise<DashboardSummary> {
    const [balances, period, todaySales, todayProfit] = await Promise.all([
      this.getBalances(branchId),
      this.getPeriodSummary(branchId, today),
      this.getTodaySales(branchId, today.from, today.to),
      this.getTodayProfit(branchId, today.from, today.to),
    ]);

    return {
      cash: balances.cash,
      bank: balances.bank,
      inventoryValue: balances.inventoryValue,
      liabilities: balances.liabilities,
      revenue: period.revenue,
      cogs: period.cogs,
      expenses: period.expenses,
      grossProfit: period.grossProfit,
      netProfit: period.netProfit,
      todaySales,
      todayProfit,
      branchId,
      asOf: Date.now(),
    };
  }
}
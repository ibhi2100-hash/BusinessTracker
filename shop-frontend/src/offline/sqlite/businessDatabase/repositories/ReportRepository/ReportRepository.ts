// repositories/SQLiteProjectionRepository/SQLiteReportRepository.ts

import { ReportRepository } from "./ReportRepositoryContract";
import { ReportStatements } from "../../statements/report/reportStatements";
import {
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
  PeriodFilter,
  DashboardSummary
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
      cash: 0, bank: 0, inventoryValue: 0,
      liabilities: 0, ownerCapital: 0, ownerDrawings: 0,
      revenue: 0, cogs: 0, expenses: 0,
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
      todaySales: 0,               // not relevant for arbitrary period
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
}
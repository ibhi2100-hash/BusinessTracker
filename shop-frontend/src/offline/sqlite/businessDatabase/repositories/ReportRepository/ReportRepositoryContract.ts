// repositories/SQLiteProjectionRepository/ReportRepositoryContract.ts

import {
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
  PeriodFilter,
  DashboardSummary,
} from "@business/shared-types";

export interface ReportBalances {
  cash: number;
  bank: number;
  inventoryValue: number;
  liabilities: number;
  ownerCapital: number;
  ownerDrawings: number;
}

export interface ReportRepository {
  getPeriodSummary(branchId: string, period: PeriodFilter): Promise<ReportSummary>;

  getMonthlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<MonthlyRow[]>;

  getYearlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<YearlyRow[]>;

  getComparison(
    branchId: string,
    current: PeriodFilter,
    previous: PeriodFilter
  ): Promise<ComparisonResult>;

  getPeriodRevenue(branchId: string, period: PeriodFilter): Promise<number>;
  getPeriodCogs(branchId: string, period: PeriodFilter): Promise<number>;
  getPeriodExpenses(branchId: string, period: PeriodFilter): Promise<number>;

  getTodaySales(branchId: string, from: number, to: number): Promise<number>;
  getTodayProfit(branchId: string, from: number, to: number): Promise<number>;

  getBalances(branchId: string): Promise<ReportBalances>;

  getDashboard(branchId: string, today: PeriodFilter): Promise<DashboardSummary>;
}
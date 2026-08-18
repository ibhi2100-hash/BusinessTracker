import { PeriodFilter, ReportSummary, MonthlyRow, YearlyRow, ComparisonResult } from "@business/shared-types";

// repositories/.../repositoryContract.ts  (add this)

export interface ReportRepository {
  getPeriodSummary(
    branchId: string,
    period: PeriodFilter
  ): Promise<ReportSummary>;

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
}
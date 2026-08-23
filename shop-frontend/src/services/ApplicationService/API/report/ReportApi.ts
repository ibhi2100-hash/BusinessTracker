// api/ReportApi.ts

import { BusinessManager } from "@/src/Composer/BusinessManager";
import {
  PeriodFilter,
  ReportSummary,
  MonthlyRow,
  YearlyRow,
  ComparisonResult,
  DashboardSummary,
} from "@business/shared-types";

export type PresetPeriod =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year";

export function startOfDay(d = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function endOfDay(d = new Date()): number {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

export function daysAgo(n: number, from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

export function resolvePeriod(preset: PresetPeriod): PeriodFilter {
  const now = new Date();

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = daysAgo(1, now);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "7d":
      return { from: startOfDay(daysAgo(6, now)), to: endOfDay(now) };
    case "30d":
      return { from: startOfDay(daysAgo(29, now)), to: endOfDay(now) };
    case "this_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        to: endOfDay(now),
      };
    case "last_month": {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      return {
        from: new Date(last.getFullYear(), last.getMonth(), 1).getTime(),
        to: new Date(
          last.getFullYear(),
          last.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        ).getTime(),
      };
    }
    case "this_year":
      return {
        from: new Date(now.getFullYear(), 0, 1).getTime(),
        to: endOfDay(now),
      };
    case "last_year": {
      const y = now.getFullYear() - 1;
      return {
        from: new Date(y, 0, 1).getTime(),
        to: new Date(y, 11, 31, 23, 59, 59, 999).getTime(),
      };
    }
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

export function previousPeriodOf(current: PeriodFilter): PeriodFilter {
  const length = current.to - current.from;
  return {
    from: current.from - length - 1,
    to: current.from - 1,
  };
}

export class ReportApi {
  constructor(private readonly manager: BusinessManager) {}

  private async repo() {
    const app = await this.manager.current();
    return app.storage.repositories.report;
  }

  async getPeriodSummary(
    branchId: string,
    period: PeriodFilter
  ): Promise<ReportSummary> {
    return (await this.repo()).getPeriodSummary(branchId, period);
  }

  async getPresetSummary(
    branchId: string,
    preset: PresetPeriod
  ): Promise<ReportSummary> {
    return this.getPeriodSummary(branchId, resolvePeriod(preset));
  }

  async getDashboard(branchId: string): Promise<DashboardSummary> {
    const today = resolvePeriod("today");
    return (await this.repo()).getDashboard(branchId, today);
  }

  async getMonthlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<MonthlyRow[]> {
    return (await this.repo()).getMonthlyBreakdown(branchId, from, to);
  }

  async getYearlyBreakdown(
    branchId: string,
    from: number,
    to: number
  ): Promise<YearlyRow[]> {
    return (await this.repo()).getYearlyBreakdown(branchId, from, to);
  }

  async getComparison(
    branchId: string,
    current: PeriodFilter,
    previous?: PeriodFilter
  ): Promise<ComparisonResult> {
    const prev = previous ?? previousPeriodOf(current);
    return (await this.repo()).getComparison(branchId, current, prev);
  }

  async getMonthOverMonth(branchId: string): Promise<ComparisonResult> {
    return this.getComparison(
      branchId,
      resolvePeriod("this_month"),
      resolvePeriod("last_month")
    );
  }

  async getLast12Months(branchId: string): Promise<MonthlyRow[]> {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
    return this.getMonthlyBreakdown(branchId, from, endOfDay(now));
  }

  async getYearSeries(
    branchId: string,
    yearsBack = 5
  ): Promise<YearlyRow[]> {
    const now = new Date();
    const from = new Date(now.getFullYear() - yearsBack + 1, 0, 1).getTime();
    return this.getYearlyBreakdown(branchId, from, endOfDay(now));
  }

  async getPeriodRevenue(branchId: string, period: PeriodFilter) {
    return (await this.repo()).getPeriodRevenue(branchId, period);
  }

  async getPeriodCogs(branchId: string, period: PeriodFilter) {
    return (await this.repo()).getPeriodCogs(branchId, period);
  }

  async getPeriodExpenses(branchId: string, period: PeriodFilter) {
    return (await this.repo()).getPeriodExpenses(branchId, period);
  }

  async getBalances(branchId: string) {
    return (await this.repo()).getBalances(branchId);
  }
}
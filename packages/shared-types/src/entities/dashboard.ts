// src/offline/sqlite/businessDatabase/types/dashboard.ts

export interface DashboardSummary {
  // Live balances (from ledger)
  cash: number;
  bank: number;
  inventoryValue: number;          // from INVENTORY account or calculated
  liabilities: number;


  // Performance (time-bound)
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;             // revenue - cogs
  netProfit: number;               // revenue - cogs - expenses

  // Today
  todaySales: number;
  todayProfit: number;

  // Meta
  branchId: string;
  asOf: number;                    // timestamp of the snapshot
}

export interface PeriodFilter {
  from: number;                    // unix ms
  to: number;                      // unix ms
}

export interface ReportSummary extends DashboardSummary {
  period: PeriodFilter;
  previousPeriod?: DashboardSummary | null; // for comparison
}

// src/offline/sqlite/businessDatabase/types/report.ts


export interface ReportSummary extends DashboardSummary {
  period: PeriodFilter;
  previousPeriod?: DashboardSummary | null;
  delta?: {
    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    todaySales?: number;
  } | null;
}

export interface MonthlyRow {
  month: string;          // "2026-01", "2026-02", ...
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface YearlyRow {
  year: number;
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface ComparisonResult {
  current: ReportSummary;
  previous: ReportSummary | null;
  delta: NonNullable<ReportSummary["delta"]> | null;
}
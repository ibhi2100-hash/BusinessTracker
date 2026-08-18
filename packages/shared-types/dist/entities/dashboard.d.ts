export interface DashboardSummary {
    cash: number;
    bank: number;
    inventoryValue: number;
    liabilities: number;
    revenue: number;
    cogs: number;
    expenses: number;
    grossProfit: number;
    netProfit: number;
    todaySales: number;
    todayProfit: number;
    branchId: string;
    asOf: number;
}
export interface PeriodFilter {
    from: number;
    to: number;
}
export interface ReportSummary extends DashboardSummary {
    period: PeriodFilter;
    previousPeriod?: DashboardSummary | null;
}
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
    month: string;
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

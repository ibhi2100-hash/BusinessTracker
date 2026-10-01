// statements/report/reportStatementKeys.ts

export const reportKeys = {
  // Full period summary (balances + performance)
  periodSummary: "report_period_summary",

  // Breakdowns
  monthlyBreakdown: "report_monthly_breakdown",
  yearlyBreakdown: "report_yearly_breakdown",

  // Individual helpers
  periodRevenue: "report_period_revenue",
  periodCogs: "report_period_cogs",
  periodExpenses: "report_period_expenses",

  // Today (dashboard)
  todaySales: "report_today_sales",
  todayProfit: "report_today_profit",

  // Balances only (no period filter)
  balances: "report_balances",
} as const;
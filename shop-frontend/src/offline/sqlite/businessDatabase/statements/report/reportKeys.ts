// statements/report/reportStatementKeys.ts

export const reportKeys = {
  // Full period summary (balances + performance)
  periodSummary: "report_period_summary",

  // Breakdowns
  monthlyBreakdown: "report_monthly_breakdown",
  yearlyBreakdown: "report_yearly_breakdown",

  // Individual helpers (optional, if you want finer control)
  periodRevenue: "report_period_revenue",
  periodCogs: "report_period_cogs",
  periodExpenses: "report_period_expenses",
} as const;
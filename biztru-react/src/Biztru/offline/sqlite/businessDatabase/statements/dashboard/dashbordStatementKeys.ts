// statements/dashboard/dashboardStatementKeys.ts

export const dashboardKeys = {
  // Live balances (no time filter)
  balances: "dashboard_balances",

  // Time-bound aggregates
  revenue: "dashboard_revenue",
  cogs: "dashboard_cogs",
  expenses: "dashboard_expenses",
  todaySales: "dashboard_today_sales",

  // Full summary in one query (recommended)
  summary: "dashboard_summary",

  // Inventory value (optional – can also come from ledger INVENTORY)
  inventoryValue: "dashboard_inventory_value",
} as const;
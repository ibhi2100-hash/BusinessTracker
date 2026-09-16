// expenseStatementKeys.ts
export const expenseKeys = {
  expenseUpsert: "expense_upsert",
  findById: "expense_find_by_id",
  expenseDelete: "expense_delete",
  expenseUpdate: "expense_update",
  findAll: "expense_find_all",
  findByBranch: "expense_find_by_branch",
  findByCategory: "expense_find_by_category",
  findByGroup: "expense_find_by_group",
  listExpenses: "expense_list",
  countExpenses: "expense_count",
  summaryByDateRange: "expense_summary_by_date_range",
  summaryByCategory: "expense_summary_by_category",
  getAllExpenses: "get_all_expenses",
} as const;
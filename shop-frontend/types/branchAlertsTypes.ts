export interface Alert {
  id: string;
  branchId: string;
  type:
    | "LOW_STOCK"
    | "OVERDUE_LIABILITY"
    | "PAYMENT_DUE"
    | "SUBSCRIPTION"
    | "NEGATIVE_CASH"
    | "EXPENSE_SPIKE";
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  createdAt: string;
  resolved: boolean;
}
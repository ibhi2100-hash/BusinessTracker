import { Mode } from "../enums/Mode";
export type ExpenseStatus = "recorded" | "voided" | "reimbursed";
export type ExpensePaymentMethod = "cash" | "transfer" | "card" | "other";
/**
 * Expense read-model / projection entity.
 * One row = one expense line (or one recorded spend).
 * Multiple lines that were submitted together can share `expenseGroupId`.
 */
export interface Expense {
    id: string;
    businessId: string;
    branchId: string | null;
    categoryId: string | null;
    categoryName: string | null;
    title: string;
    description: string | null;
    amount: number;
    paymentMethod: ExpensePaymentMethod | null;
    vendorId: string | null;
    vendorRef: string | null;
    userId: string | null;
    receiptRef: string | null;
    note: string | null;
    status: ExpenseStatus;
    expenseGroupId: string | null;
    mode: Mode;
    /** When the money was actually spent */
    incurredAt: number;
    createdAt: number;
    updatedAt: number | null;
}
export interface ExpenseSummaryRow {
    totalAmount: number;
    recordedCount: number;
    voidedCount: number;
    reimbursedAmount: number;
}
export interface ExpenseCategorySummaryRow {
    categoryId: string | null;
    categoryName: string | null;
    totalAmount: number;
    transactionCount: number;
}

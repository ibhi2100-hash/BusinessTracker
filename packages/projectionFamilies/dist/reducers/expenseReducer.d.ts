import { DomainEvent, Expense, Mode, ExpensePaymentMethod } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface ExpenseRecordedPayload {
    title: string;
    description?: string | null;
    amount: number;
    categoryId?: string | null;
    categoryName?: string | null;
    paymentMethod?: ExpensePaymentMethod | null;
    vendorId?: string | null;
    vendorRef?: string | null;
    receiptRef?: string | null;
    note?: string | null;
    expenseGroupId?: string | null;
    /** When the money was actually spent (ms). Defaults to event time. */
    incurredAt?: number;
    mode?: Mode;
}
interface ExpenseVoidedPayload {
    expenseId?: string;
    reason?: string;
}
interface ExpenseReimbursedPayload {
    expenseId?: string;
    /** Money returned to the business / employee */
    amount: number;
    reason?: string;
}
type ExpenseEventPayload = ExpenseRecordedPayload | ExpenseVoidedPayload | ExpenseReimbursedPayload;
export declare class ExpenseReducer implements ProjectionReducer<Expense, DomainEvent> {
    reduce(state: Expense | null, event: DomainEvent<ExpenseEventPayload>): Expense;
    private onExpenseRecorded;
    private onExpenseVoided;
    private onExpenseReimbursed;
}
export {};

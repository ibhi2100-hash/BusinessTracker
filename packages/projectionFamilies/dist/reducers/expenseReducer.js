"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReducer = void 0;
const shared_types_1 = require("@business/shared-types");
/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */
class ExpenseReducer {
    reduce(state, event) {
        switch (event.type) {
            case shared_types_1.expenseEventType.EXPENSE_RECORDED:
                return this.onExpenseRecorded(event);
            case shared_types_1.expenseEventType.EXPENSE_VOIDED:
                return this.onExpenseVoided(state, event);
            case shared_types_1.expenseEventType.EXPENSE_REIMBURSED:
                return this.onExpenseReimbursed(state, event);
            default:
                if (!state) {
                    throw new Error(`ExpenseReducer: cannot apply ${event.type} without existing state`);
                }
                return state;
        }
    }
    /* ================================================================ */
    /*  EXPENSE_RECORDED                                                */
    /* ================================================================ */
    onExpenseRecorded(event) {
        const p = event.payload;
        const amount = Math.max(0, Number(p.amount) || 0);
        const now = event.createdAt ?? Date.now();
        const incurredAt = p.incurredAt ?? now;
        const title = (p.title && String(p.title).trim()) ||
            (p.description && String(p.description).trim()) ||
            "Expense";
        return {
            id: event.aggregateId,
            businessId: event.businessId,
            branchId: event.branchId ?? null,
            categoryId: p.categoryId ?? null,
            categoryName: p.categoryName ?? null,
            title,
            description: p.description ?? null,
            amount,
            paymentMethod: (p.paymentMethod ?? null),
            vendorId: p.vendorId ?? null,
            vendorRef: p.vendorRef ?? null,
            userId: event.actor?.userId ?? null,
            receiptRef: p.receiptRef ?? null,
            note: p.note ?? null,
            status: "recorded",
            expenseGroupId: p.expenseGroupId ?? null,
            mode: (p.mode ?? event.mode ?? "LIVE"),
            incurredAt,
            createdAt: now,
            updatedAt: now,
        };
    }
    /* ================================================================ */
    /*  EXPENSE_VOIDED                                                  */
    /* ================================================================ */
    onExpenseVoided(state, event) {
        if (!state) {
            throw new Error(`ExpenseReducer: EXPENSE_VOIDED requires existing expense (${event.aggregateId})`);
        }
        const now = event.createdAt ?? Date.now();
        return {
            ...state,
            status: "voided",
            note: event.payload?.reason ?? state.note ?? "Voided",
            // Keep original amount for audit; summary queries skip voided rows
            updatedAt: now,
        };
    }
    /* ================================================================ */
    /*  EXPENSE_REIMBURSED                                              */
    /* ================================================================ */
    onExpenseReimbursed(state, event) {
        if (!state) {
            throw new Error(`ExpenseReducer: EXPENSE_REIMBURSED requires existing expense (${event.aggregateId})`);
        }
        const p = event.payload;
        const refundAmount = Math.max(0, Number(p.amount) || 0);
        const now = event.createdAt ?? Date.now();
        const isFull = refundAmount >= state.amount;
        if (isFull) {
            return {
                ...state,
                status: "reimbursed",
                note: p.reason ?? state.note ?? "Reimbursed",
                updatedAt: now,
            };
        }
        // Partial reimbursement: reduce remaining amount, stay recorded
        // until fully reimbursed
        const nextAmount = Math.max(0, state.amount - refundAmount);
        return {
            ...state,
            amount: nextAmount,
            note: p.reason ?? state.note,
            status: nextAmount <= 0 ? "reimbursed" : state.status,
            updatedAt: now,
        };
    }
}
exports.ExpenseReducer = ExpenseReducer;

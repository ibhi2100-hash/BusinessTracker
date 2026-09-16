import {
  DomainEvent,
  Expense,
  ExpenseStatus,
  Mode,
  ExpensePaymentMethod,
  expenseEventType,
} from "@business/shared-types";

import { ProjectionReducer } from "../contracts/ProjectionReducer";

/* ------------------------------------------------------------------ */
/*  Event payloads                                                    */
/* ------------------------------------------------------------------ */

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

type ExpenseEventPayload =
  | ExpenseRecordedPayload
  | ExpenseVoidedPayload
  | ExpenseReimbursedPayload;

/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */

export class ExpenseReducer
  implements ProjectionReducer<Expense, DomainEvent>
{
  reduce(
    state: Expense | null,
    event: DomainEvent<ExpenseEventPayload>
  ): Expense {
    switch (event.type) {
      case expenseEventType.EXPENSE_RECORDED:
        return this.onExpenseRecorded(
          event as DomainEvent<ExpenseRecordedPayload>
        );

      case expenseEventType.EXPENSE_VOIDED:
        return this.onExpenseVoided(
          state,
          event as DomainEvent<ExpenseVoidedPayload>
        );

      case expenseEventType.EXPENSE_REIMBURSED:
        return this.onExpenseReimbursed(
          state,
          event as DomainEvent<ExpenseReimbursedPayload>
        );

      default:
        if (!state) {
          throw new Error(
            `ExpenseReducer: cannot apply ${event.type} without existing state`
          );
        }
        return state;
    }
  }

  /* ================================================================ */
  /*  EXPENSE_RECORDED                                                */
  /* ================================================================ */

  private onExpenseRecorded(
    event: DomainEvent<ExpenseRecordedPayload>
  ): Expense {
    const p = event.payload;
    const amount = Math.max(0, Number(p.amount) || 0);
    const now = event.createdAt ?? Date.now();
    const incurredAt = p.incurredAt ?? now;

    const title =
      (p.title && String(p.title).trim()) ||
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

      paymentMethod: (p.paymentMethod ?? null) as ExpensePaymentMethod | null,

      vendorId: p.vendorId ?? null,
      vendorRef: p.vendorRef ?? null,

      userId: event.actor?.userId ?? null,
      receiptRef: p.receiptRef ?? null,
      note: p.note ?? null,

      status: "recorded" as ExpenseStatus,
      expenseGroupId: p.expenseGroupId ?? null,

      mode: (p.mode ?? event.mode ?? "LIVE") as Mode,

      incurredAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  /* ================================================================ */
  /*  EXPENSE_VOIDED                                                  */
  /* ================================================================ */

  private onExpenseVoided(
    state: Expense | null,
    event: DomainEvent<ExpenseVoidedPayload>
  ): Expense {
    if (!state) {
      throw new Error(
        `ExpenseReducer: EXPENSE_VOIDED requires existing expense (${event.aggregateId})`
      );
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

  private onExpenseReimbursed(
    state: Expense | null,
    event: DomainEvent<ExpenseReimbursedPayload>
  ): Expense {
    if (!state) {
      throw new Error(
        `ExpenseReducer: EXPENSE_REIMBURSED requires existing expense (${event.aggregateId})`
      );
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
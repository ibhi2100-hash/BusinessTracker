// ExpenseApi.ts
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { AggregateType } from "@/offline/domain/aggregate";
import { Expense, expenseEventType } from "@business/shared-types";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import {
  ExpenseSummaryRow,
  ExpenseCategorySummaryRow,
} from "@business/shared-types";

export type ExpenseMode = "OPENING" | "LIVE";

export interface CreateExpenseRequest {
  aggregateType?: AggregateType;
  aggregateId?: string;
  mode: ExpenseMode;
  payload: {
    title: string;
    amount: number;
    categoryId?: string;
    categoryName?: string;
    description?: string;
    paymentMethod?: "cash" | "transfer" | "card" | "other";
    vendorRef?: string;
    vendorId?: string;
    receiptRef?: string;
    note?: string;
    branchId?: string;
    businessId?: string;
    incurredAt?: number; // ms; default now
    expenseGroupId?: string;
  };
}

export interface CreateBatchExpenseRequest {
  mode: ExpenseMode;
  expenseGroupId?: string;
  branchId?: string;
  businessId?: string;
  paymentMethod?: "cash" | "transfer" | "card" | "other";
  note?: string;
  lines: Array<{
    title: string;
    amount: number;
    categoryId?: string;
    categoryName?: string;
    description?: string;
    incurredAt?: number;
  }>;
}

export interface VoidExpenseRequest {
  expenseId: string;
  mode: ExpenseMode;
  reason?: string;
  branchId?: string;
}

export interface ReimburseExpenseRequest {
  expenseId: string;
  mode: ExpenseMode;
  amount: number;
  reason?: string;
  branchId?: string;
}

export interface ExpenseFilters {
  businessId: string;
  branchId?: string;
  categoryId?: string;
  from?: number;
  to?: number;
  status?: "recorded" | "voided" | "reimbursed" | "all";
  limit?: number;
  offset?: number;
}

export class ExpenseApi {
  constructor(private readonly manager: BusinessManager) {}

  /* ========== WRITE ========== */

  async createExpense(
    request: CreateExpenseRequest
  ): Promise<{ expenseId: string }> {
    const expenseId = request.aggregateId ?? crypto.randomUUID();
    const amount = Number(request.payload.amount) || 0;

    if (amount <= 0) {
      throw new Error("Expense amount must be greater than zero");
    }

    const app = await this.manager.current();
    const now = Date.now();

    const intent: CommandIntent<any> = {
      aggregateType: request.aggregateType ?? AggregateType.EXPENSE,
      aggregateId: expenseId,
      type: expenseEventType.EXPENSE_RECORDED,
      mode: request.mode,
      payload: {
        ...request.payload,
        amount,
        status: "recorded",
        incurredAt: request.payload.incurredAt ?? now,
        createdAt: now,
      },
    };

    const command = await app.domain.commandFactory.create(intent);
    await app.domain.kernel.execute(command);

    return { expenseId };
  }

  async createBatchExpense(
    request: CreateBatchExpenseRequest
  ): Promise<{ expenseGroupId: string; lineIds: string[] }> {
    if (!request.lines?.length) {
      throw new Error("Batch expense requires at least one line");
    }

    const expenseGroupId = request.expenseGroupId ?? crypto.randomUUID();
    const lineIds: string[] = [];

    for (const line of request.lines) {
      const lineId = crypto.randomUUID();
      lineIds.push(lineId);

      await this.createExpense({
        aggregateId: lineId,
        mode: request.mode,
        payload: {
          ...line,
          branchId: request.branchId,
          businessId: request.businessId,
          paymentMethod: request.paymentMethod,
          note: request.note,
          expenseGroupId,
        },
      });
    }

    return { expenseGroupId, lineIds };
  }

  async voidExpense(request: VoidExpenseRequest): Promise<void> {
    const app = await this.manager.current();

    const intent: CommandIntent<any> = {
      aggregateType: AggregateType.EXPENSE,
      aggregateId: request.expenseId,
      type: expenseEventType.EXPENSE_VOIDED,
      mode: request.mode,
      payload: {
        expenseId: request.expenseId,
        reason: request.reason ?? "Voided by user",
        branchId: request.branchId,
        voidedAt: Date.now(),
        status: "voided",
      },
    };

    const command = await app.domain.commandFactory.create(intent);
    await app.domain.kernel.execute(command);
  }

  async reimburseExpense(
    request: ReimburseExpenseRequest
  ): Promise<{ reimbursementId: string }> {
    if (request.amount <= 0) {
      throw new Error("Reimbursement amount must be greater than zero");
    }

    const reimbursementId = crypto.randomUUID();
    const app = await this.manager.current();

    const intent: CommandIntent<any> = {
      aggregateType: AggregateType.EXPENSE,
      aggregateId: request.expenseId,
      type: expenseEventType.EXPENSE_REIMBURSED,
      mode: request.mode,
      payload: {
        reimbursementId,
        expenseId: request.expenseId,
        amount: request.amount,
        reason: request.reason ?? "Reimbursed",
        branchId: request.branchId,
        reimbursedAt: Date.now(),
        status: "reimbursed",
      },
    };

    const command = await app.domain.commandFactory.create(intent);
    await app.domain.kernel.execute(command);

    return { reimbursementId };
  }

  /* ========== READ ========== */

  async getExpense(expenseId: string): Promise<Expense | null> {
    const app = await this.manager.current();
    return app.storage.repositories.expenses.findById(expenseId);
  }

  async listExpenses(filters: ExpenseFilters): Promise<Expense[]> {
    const app = await this.manager.current();
    return app.storage.repositories.expenses.list({
      businessId: filters.businessId,
      branchId: filters.branchId,
      categoryId: filters.categoryId,
      from: filters.from,
      to: filters.to,
      status: filters.status ?? "all",
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0,
    });
  }

  async getExpenseGroup(expenseGroupId: string): Promise<Expense[]> {
    const app = await this.manager.current();
    return app.storage.repositories.expenses.findByGroup(expenseGroupId);
  }

  async getExpenseSummary(filters: {
    from?: number;
    to?: number;
    branchId?: string | null;
  }): Promise<ExpenseSummaryRow> {
    const app = await this.manager.current();
    return app.storage.repositories.expenses.summary(filters);
  }

  async getExpenseByCategory(filters: {
    businessId: string;
    from?: number;
    to?: number;
    branchId?: string | null;
  }): Promise<ExpenseCategorySummaryRow[]> {
    const app = await this.manager.current();
    return app.storage.repositories.expenses.summaryByCategory(filters);
  }

  async getTodayExpenseSummary(
    businessId: string,
    branchId?: string
  ): Promise<ExpenseSummaryRow> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.getExpenseSummary({
      from: start.getTime(),
      to: end.getTime(),
      branchId,
    });
  }
}
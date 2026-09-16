// SQLiteExpenseRepository.ts
import { Expense, ExpenseSummaryRow, ExpenseCategorySummaryRow } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { ExpenseStatement } from "../../statements/expense/expenseStatements";

export interface ExpenseListFilters {
  businessId: string;
  branchId?: string | null;
  categoryId?: string | null;
  from?: number | null;   // ms epoch (or ISO if you prefer; keep consistent with sales)
  to?: number | null;
  status?: "recorded" | "voided" | "reimbursed" | "all";
  limit?: number;
  offset?: number;
}

export interface ExpenseCountRow {
  count: number;
}

export class SQLiteExpenseRepository
  implements IProjectionEntityRepository<Expense>
{
  constructor(private readonly statements: ExpenseStatement) {}

  // ---------- WRITE ----------

  async upsert(state: Expense): Promise<void> {
    await this.statements.upsert.execute(ExpenseMapper.toInsert(state));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async update(state: Expense): Promise<void> {
    await this.statements.update.execute(ExpenseMapper.toUpdate(state));
  }

  // ---------- SINGLE ----------

  async findById(id: string): Promise<Expense | null> {
    const rows = await this.statements.findById.query<Expense>([id]);
    return rows[0] ?? null;
  }

  // ---------- BASIC READS ----------

  async findAll(): Promise<Expense[]> {
    return this.statements.findAll.query<Expense>([]);
  }

  async findByBranch(branchId: string): Promise<Expense[]> {
    return this.statements.findByBranch.query<Expense>([branchId]);
  }

  async findByCategory(categoryId: string): Promise<Expense[]> {
    return this.statements.findByCategory.query<Expense>([categoryId]);
  }

  async findByGroup(expenseGroupId: string): Promise<Expense[]> {
    return this.statements.findByGroup.query<Expense>([expenseGroupId]);
  }

  // ---------- CANONICAL LIST ----------

  async list(filters: ExpenseListFilters): Promise<Expense[]> {
    if (!filters.businessId) {
      throw new Error("Expense list requires businessId");
    }

    const branchId = filters.branchId ?? null;
    const categoryId = filters.categoryId ?? null;
    const from = filters.from ?? null;
    const to = filters.to ?? null;
    const status = filters.status ?? "all";

    const limit = Math.min(Math.max(Math.floor(filters.limit ?? 100), 1), 500);
    const offset = Math.max(Math.floor(filters.offset ?? 0), 0);

    const params = [
      filters.businessId,
      branchId, branchId,
      categoryId, categoryId,
      from, from,
      to, to,
      status, status,
      limit,
      offset,
    ];

    return this.statements.listExpenses.query<Expense>(params);
  }

  // ---------- COUNT ----------

  async count(
    filters: Omit<ExpenseListFilters, "limit" | "offset">
  ): Promise<number> {
    if (!filters.businessId) {
      throw new Error("Expense count requires businessId");
    }

    const branchId = filters.branchId ?? null;
    const categoryId = filters.categoryId ?? null;
    const from = filters.from ?? null;
    const to = filters.to ?? null;
    const status = filters.status ?? "all";

    const rows = await this.statements.countExpenses.query<ExpenseCountRow>([
      filters.businessId,
      branchId, branchId,
      categoryId, categoryId,
      from, from,
      to, to,
      status, status,
    ]);

    return Number(rows[0]?.count ?? 0);
  }

  // ---------- SUMMARY ----------

  async summary(filters: {
    from?: number;
    to?: number;
    branchId?: string | null;
  } = {}): Promise<ExpenseSummaryRow> {
    const from = filters.from ?? 0;
    const to = filters.to ?? Number.MAX_SAFE_INTEGER;
    const branchId = filters.branchId ?? null;

    const rows =
      await this.statements.summaryByDateRange.query<ExpenseSummaryRow>([
        from,
        to,
        branchId,
        branchId,
      ]);

    return (
      rows[0] ?? {
        totalAmount: 0,
        recordedCount: 0,
        voidedCount: 0,
        reimbursedAmount: 0,
      }
    );
  }

  async summaryByCategory(filters: {
    businessId: string;
    from?: number;
    to?: number;
    branchId?: string | null;
  }): Promise<ExpenseCategorySummaryRow[]> {
    const from = filters.from ?? 0;
    const to = filters.to ?? Number.MAX_SAFE_INTEGER;
    const branchId = filters.branchId ?? null;

    return this.statements.summaryByCategory.query<ExpenseCategorySummaryRow>([
      filters.businessId,
      from,
      to,
      branchId,
      branchId,
    ]);
  }

  // ---------- INTERNAL ----------

  async getAllExpenses(): Promise<Expense[]> {
    return this.statements.allExpenses.query<Expense>([]);
  }
}

// ---------- Mapper ----------

export class ExpenseMapper {
  static toInsert(expense: Expense): unknown[] {
    return [
      expense.id,
      expense.businessId,
      expense.branchId ?? "",
      expense.categoryId ?? "",
      expense.categoryName ?? "",
      expense.title,
      expense.description ?? "",
      expense.amount,
      expense.paymentMethod ?? "",
      expense.vendorRef ?? "",
      expense.vendorId ?? "",
      expense.userId ?? "",
      expense.receiptRef ?? "",
      expense.note ?? "",
      expense.status ?? "recorded",
      expense.expenseGroupId ?? "",
      expense.mode ?? "LIVE",
      expense.incurredAt,
      expense.createdAt,
      expense.updatedAt ?? expense.createdAt,
    ];
  }

  static toUpdate(expense: Expense): unknown[] {
    return [
      expense.amount,
      expense.status,
      expense.note ?? "",
      expense.updatedAt ?? Date.now(),
      expense.id,
    ];
  }
}
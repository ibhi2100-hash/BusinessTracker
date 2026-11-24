
import type {
  SQLiteStatementOperation,
} from "../../../../../storage/statement/worker/WorkerProtocol";

import { BillingPlanStatement } from "../../statements/billing/plans/billingPlanStatements";
import { billingPlanKeys } from "../../statements/billing/plans/billingPlanStatementKey";
import type { BillingPlanRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";

export type LocalBillingPlanStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RETIRED"
  | "ARCHIVED";


export interface BillingPlanListFilters {
  status?: LocalBillingPlanStatus | "all";
  search?: string | null;
  limit?: number;
  offset?: number;
}

export interface BillingPlanCountRow {
  count: number;
}

export class SQLiteBillingPlanRepository {
  private readonly statements: BillingPlanStatement;

  constructor(statements: BillingPlanStatement) {
    this.statements = statements;
  }

  // ============================================================
  // TRANSACTION OPERATIONS
  // ============================================================

  upsertOperation(
    plan: BillingPlanRecord,
  ): SQLiteStatementOperation {
    return {
      statementKey: billingPlanKeys.upsert,
      params: BillingPlanMapper.toInsert(plan),
    };
  }

  updateOperation(
    plan: BillingPlanRecord,
  ): SQLiteStatementOperation {
    return {
      statementKey: billingPlanKeys.update,
      params: BillingPlanMapper.toUpdate(plan),
    };
  }

  deleteOperation(
    id: string,
  ): SQLiteStatementOperation {
    return {
      statementKey: billingPlanKeys.delete,
      params: [id],
    };
  }

  // ============================================================
  // IMMEDIATE WRITES
  // ============================================================

  async upsert(plan: BillingPlanRecord): Promise<void> {
    await this.statements.upsert.execute(
      BillingPlanMapper.toInsert(plan),
    );
  }

  async update(plan: BillingPlanRecord): Promise<void> {
    await this.statements.update.execute(
      BillingPlanMapper.toUpdate(plan),
    );
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  // ============================================================
  // SINGLE RECORD
  // ============================================================

  async findById(
    id: string,
  ): Promise<BillingPlanRecord| null> {
    const rows = await this.statements.findById.query<BillingPlanRecord>([
      id,
    ]);

    return rows[0] ?? null;
  }

  async findByCode(
    code: string,
  ): Promise<BillingPlanRecord | null> {
    const rows = await this.statements.findByCode.query<BillingPlanRecord>([
      code,
    ]);

    return rows[0] ?? null;
  }

  // ============================================================
  // LIST
  // ============================================================

  async findAll(): Promise<BillingPlanRecord[]> {
    return this.statements.findAll.query<BillingPlanRecord>([]);
  }

  async list(
    filters: BillingPlanListFilters = {},
  ): Promise<BillingPlanRecord[]> {
    const status = filters.status ?? "all";
    const search = filters.search?.trim() || null;

    const limit = Math.min(
      Math.max(Math.floor(filters.limit ?? 100), 1),
      500,
    );

    const offset = Math.max(
      Math.floor(filters.offset ?? 0),
      0,
    );

    return this.statements.list.query<BillingPlanRecord>([
      status,
      status,
      search,
      search,
      search,
      limit,
      offset,
    ]);
  }

  async findPublished(): Promise<BillingPlanRecord[]> {
    return this.statements.findPublished.query<BillingPlanRecord>([]);
  }

  async getAll(): Promise<BillingPlanRecord[]> {
    return this.statements.getAll.query<BillingPlanRecord>([]);
  }

  // ============================================================
  // COUNT
  // ============================================================

  async count(
    filters: Omit<BillingPlanListFilters, "limit" | "offset"> = {},
  ): Promise<number> {
    const status = filters.status ?? "all";
    const search = filters.search?.trim() || null;

    const rows = await this.statements.count.query<BillingPlanCountRow>([
      status,
      status,
      search,
      search,
      search,
    ]);

    return Number(rows[0]?.count ?? 0);
  }

  // ============================================================
  // SYNCHRONIZATION
  // ============================================================

  /**
   * Applies a complete authoritative plan snapshot.
   *
   * The caller must execute these operations inside the same
   * SQLite transaction as the corresponding plan-version updates.
   *
   * This method does not delete plans absent from a partial API
   * response. Use an explicit full-snapshot reconciliation policy
   * before removing or archiving missing catalogue records.
   */
  syncOperations(
    plans: BillingPlanRecord[],
  ): SQLiteStatementOperation[] {
    return plans.map((plan) => this.upsertOperation(plan));
  }
}

// ================================================================
// MAPPER
// ================================================================

export class BillingPlanMapper {
  static toInsert(plan: BillingPlanRecord): unknown[] {
    return [
      plan.id,
      plan.code,
      plan.name,
      plan.description,
      plan.status,
      plan.displayOrder,
      plan.isFeatured ? 1 : 0,
      plan.createdAt,
      plan.updatedAt,
    ];
  }

  static toUpdate(plan: BillingPlanRecord): unknown[] {
    return [
      plan.code,
      plan.name,
      plan.description,
      plan.status,
      plan.displayOrder,
      plan.isFeatured ? 1 : 0,
      plan.updatedAt,
      plan.id,
    ];
  }
}

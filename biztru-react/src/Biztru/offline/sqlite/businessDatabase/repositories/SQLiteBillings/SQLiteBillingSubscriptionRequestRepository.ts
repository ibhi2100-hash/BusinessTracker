import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingSubscriptionRequestStatement } from "../../statements/billing/requests/billingSubscriptionRequestStatements";
import { billingSubscriptionRequestKeys } from "../../statements/billing/requests/billingSubscriptionRequestStatementKey";
import type { BillingSubscriptionRequestRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";

export interface BillingCountRow { count: number; }

export class SQLiteBillingSubscriptionRequestRepository {
  private readonly statements: BillingSubscriptionRequestStatement
  constructor(statements: BillingSubscriptionRequestStatement) {
    this.statements  = statements
  }

  upsertOperation(record: BillingSubscriptionRequestRecord): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionRequestKeys.upsert, params: LocalBillingSubscriptionRequestMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionRequestKeys.delete, params: [id] };
  }

  async upsert(record: BillingSubscriptionRequestRecord): Promise<void> {
    LocalBillingSubscriptionRequestMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingSubscriptionRequestMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingSubscriptionRequestRecord | null> {
    const rows = await this.statements.findById.query<BillingSubscriptionRequestRecord>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<BillingSubscriptionRequestRecord[]> {
    return this.statements.findByBusiness.query<BillingSubscriptionRequestRecord>([businessId]);
  }

  async findPendingByBusiness(businessId: string): Promise<BillingSubscriptionRequestRecord[]> {
    return this.statements.findPendingByBusiness.query<BillingSubscriptionRequestRecord>([businessId]);
  }

  async findByBusinessAndStatus(businessId: string, status: string): Promise<BillingSubscriptionRequestRecord[]> {
    return this.statements.findByBusinessAndStatus.query<BillingSubscriptionRequestRecord>([businessId, status]);
  }

  async findByPlan(requestedPlanId: string, requestedPlanVersion: string): Promise<BillingSubscriptionRequestRecord[]> {
    return this.statements.findByPlan.query<BillingSubscriptionRequestRecord>([requestedPlanId, requestedPlanVersion]);
  }

  async findAll(): Promise<BillingSubscriptionRequestRecord[]> {
    return this.statements.findAll.query<BillingSubscriptionRequestRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingSubscriptionRequestRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingSubscriptionRequestMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingSubscriptionRequestMapper {
  static toInsert(record: BillingSubscriptionRequestRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.requestedPlanId,
      record.requestedPlanVersion,
      record.requestType,
      record.status,
      record.requestedBy,
      record.reviewedBy,
      record.reviewedAt,
      record.rejectionReason,
      record.effectiveAt,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingSubscriptionRequestRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
  }
}

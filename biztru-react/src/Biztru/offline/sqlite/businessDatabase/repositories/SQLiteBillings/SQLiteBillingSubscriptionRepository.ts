import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingSubscriptionStatement } from "../../statements/billing/subscriptions/billingSubscriptionStatements"; 
import { billingSubscriptionKeys } from "../../statements/billing/subscriptions/billingSubscriptionStatementKey";
import type { BillingSubscriptionRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";

export interface BillingCountRow { count: number; }

export class SQLiteBillingSubscriptionRepository {
  private readonly statements: BillingSubscriptionStatement;
  constructor(statements: BillingSubscriptionStatement) {
    this.statements = statements
  }

  upsertOperation(record: BillingSubscriptionRecord): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionKeys.upsert, params: LocalBillingSubscriptionMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionKeys.delete, params: [id] };
  }

  async upsert(record: BillingSubscriptionRecord): Promise<void> {
    LocalBillingSubscriptionMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingSubscriptionMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingSubscriptionRecord | null> {
    const rows = await this.statements.findById.query<BillingSubscriptionRecord>([id]);
    return rows[0] ?? null;
  }

  async findCurrentByBusiness(businessId: string): Promise<BillingSubscriptionRecord | null> {
    const rows = await this.statements.findCurrentByBusiness.query<BillingSubscriptionRecord>([businessId]);
    return rows[0] ?? null;
  }

  async findHistoryByBusiness(businessId: string): Promise<BillingSubscriptionRecord[]> {
    return this.statements.findHistoryByBusiness.query<BillingSubscriptionRecord>([businessId]);
  }

  async findByBusinessAndStatus(businessId: string, status: string): Promise<BillingSubscriptionRecord[]> {
    return this.statements.findByBusinessAndStatus.query<BillingSubscriptionRecord>([businessId, status]);
  }

  async findByPlanVersion(planId: string, planVersion: number): Promise<BillingSubscriptionRecord[]> {
    return this.statements.findByPlanVersion.query<BillingSubscriptionRecord>([planId, planVersion]);
  }

  async findExpiring(from: number, to: number): Promise<BillingSubscriptionRecord[]> {
    return this.statements.findExpiring.query<BillingSubscriptionRecord>([from, to]);
  }

  async findAll(): Promise<BillingSubscriptionRecord[]> {
    return this.statements.findAll.query<BillingSubscriptionRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingSubscriptionRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingSubscriptionMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingSubscriptionMapper {
  static toInsert(record: BillingSubscriptionRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.planId,
      record.planVersion,
      record.status,
      record.billingCycle,
      record.currency,
      record.priceMinor,
      record.trialStart,
      record.trialEnd,
      record.currentPeriodStart,
      record.currentPeriodEnd,
      record.gracePeriodEnd,
      record.cancelAtPeriodEnd,
      record.activatedAt,
      record.cancelledAt,
      record.expiredAt,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingSubscriptionRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    if (!Number.isSafeInteger(record.priceMinor) || record.priceMinor < 0) throw new Error("Invalid priceMinor.");
  }
}

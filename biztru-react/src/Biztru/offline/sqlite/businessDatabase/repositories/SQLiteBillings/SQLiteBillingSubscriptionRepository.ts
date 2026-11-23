import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingSubscriptionStatement } from "../../statements/billing/subscriptions/billingSubscriptionStatements"; 
import { billingSubscriptionKeys } from "../../statements/billing/subscriptions/billingSubscriptionStatementKey";

export interface LocalBillingSubscription {
  id: string;
  businessId: string;
  planId: string;
  planVersion: number;
  status: string;
  billingCycle: string;
  currency: string;
  priceMinor: number;
  trialStart: number | null;
  trialEnd: number | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  gracePeriodEnd: number | null;
  cancelAtPeriodEnd: number;
  activatedAt: number | null;
  cancelledAt: number | null;
  expiredAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingCountRow { count: number; }

export class SQLiteBillingSubscriptionRepository {
  private readonly statements: BillingSubscriptionStatement;
  constructor(statements: BillingSubscriptionStatement) {
    this.statements = statements
  }

  upsertOperation(record: LocalBillingSubscription): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionKeys.upsert, params: LocalBillingSubscriptionMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionKeys.delete, params: [id] };
  }

  async upsert(record: LocalBillingSubscription): Promise<void> {
    LocalBillingSubscriptionMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingSubscriptionMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<LocalBillingSubscription | null> {
    const rows = await this.statements.findById.query<LocalBillingSubscription>([id]);
    return rows[0] ?? null;
  }

  async findCurrentByBusiness(businessId: string): Promise<LocalBillingSubscription | null> {
    const rows = await this.statements.findCurrentByBusiness.query<LocalBillingSubscription>([businessId]);
    return rows[0] ?? null;
  }

  async findHistoryByBusiness(businessId: string): Promise<LocalBillingSubscription[]> {
    return this.statements.findHistoryByBusiness.query<LocalBillingSubscription>([businessId]);
  }

  async findByBusinessAndStatus(businessId: string, status: string): Promise<LocalBillingSubscription[]> {
    return this.statements.findByBusinessAndStatus.query<LocalBillingSubscription>([businessId, status]);
  }

  async findByPlanVersion(planId: string, planVersion: number): Promise<LocalBillingSubscription[]> {
    return this.statements.findByPlanVersion.query<LocalBillingSubscription>([planId, planVersion]);
  }

  async findExpiring(from: number, to: number): Promise<LocalBillingSubscription[]> {
    return this.statements.findExpiring.query<LocalBillingSubscription>([from, to]);
  }

  async findAll(): Promise<LocalBillingSubscription[]> {
    return this.statements.findAll.query<LocalBillingSubscription>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: LocalBillingSubscription[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingSubscriptionMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingSubscriptionMapper {
  static toInsert(record: LocalBillingSubscription): unknown[] {
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

  static validate(record: LocalBillingSubscription): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    if (!Number.isSafeInteger(record.priceMinor) || record.priceMinor < 0) throw new Error("Invalid priceMinor.");
  }
}

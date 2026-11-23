import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingEntitlementOverrideStatement } from "../../statements/billing/overrides/billingEntitlementOverrideStatements";
import { billingEntitlementOverrideKeys } from "../../statements/billing/overrides/billingEntitlementOverrideStatementKey"; 

export interface LocalBillingEntitlementOverride {
  id: string;
  businessId: string;
  subscriptionId: string;
  entitlementKey: string;
  valueJson: string;
  status: string;
  reason: string | null;
  startsAt: number | null;
  expiresAt: number | null;
  createdBy: string | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingCountRow { count: number; }

export class SQLiteBillingEntitlementOverrideRepository {
  private readonly statements: BillingEntitlementOverrideStatement;
  constructor(statements: BillingEntitlementOverrideStatement) {
    this.statements = statements
  }

  upsertOperation(record: LocalBillingEntitlementOverride): SQLiteStatementOperation {
    return { statementKey: billingEntitlementOverrideKeys.upsert, params: LocalBillingEntitlementOverrideMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingEntitlementOverrideKeys.delete, params: [id] };
  }

  async upsert(record: LocalBillingEntitlementOverride): Promise<void> {
    LocalBillingEntitlementOverrideMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingEntitlementOverrideMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<LocalBillingEntitlementOverride | null> {
    const rows = await this.statements.findById.query<LocalBillingEntitlementOverride>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<LocalBillingEntitlementOverride[]> {
    return this.statements.findByBusiness.query<LocalBillingEntitlementOverride>([businessId]);
  }

  async findByBusinessAndKey(businessId: string, entitlementKey: string): Promise<LocalBillingEntitlementOverride | null> {
    const rows = await this.statements.findByBusinessAndKey.query<LocalBillingEntitlementOverride>([businessId, entitlementKey]);
    return rows[0] ?? null;
  }

  async findActiveByBusiness(businessId: string, now: number,): Promise<LocalBillingEntitlementOverride[]> {
    return this.statements.findActiveByBusiness.query<LocalBillingEntitlementOverride>([businessId, now, now]);
  }

  async findBySubscription(subscriptionId: string): Promise<LocalBillingEntitlementOverride[]> {
    return this.statements.findBySubscription.query<LocalBillingEntitlementOverride>([subscriptionId]);
  }

  async findAll(): Promise<LocalBillingEntitlementOverride[]> {
    return this.statements.findAll.query<LocalBillingEntitlementOverride>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: LocalBillingEntitlementOverride[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingEntitlementOverrideMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingEntitlementOverrideMapper {
  static toInsert(record: LocalBillingEntitlementOverride): unknown[] {
    return [
      record.id,
      record.businessId,
      record.subscriptionId,
      record.entitlementKey,
      record.valueJson,
      record.status,
      record.reason,
      record.startsAt,
      record.expiresAt,
      record.createdBy,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: LocalBillingEntitlementOverride): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    try { JSON.parse(record.valueJson); } catch { throw new Error("Invalid valueJson JSON."); }
  }
}

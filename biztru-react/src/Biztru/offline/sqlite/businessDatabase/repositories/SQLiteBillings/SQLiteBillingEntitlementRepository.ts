import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingEntitlementStatement } from "../../statements/billing/entitlements/billingEntitlementStatements"; 
import { billingEntitlementKeys } from "../../statements/billing/entitlements/billingEntitlementStatementKey";
import type { BillingEntitlementRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";



export interface BillingCountRow { count: number; }

export class SQLiteBillingEntitlementRepository {
  private readonly statements: BillingEntitlementStatement
  constructor(statements: BillingEntitlementStatement) {
    this.statements = statements
  }

  upsertOperation(record: BillingEntitlementRecord): SQLiteStatementOperation {
    return { statementKey: billingEntitlementKeys.upsert, params: LocalBillingEntitlementMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingEntitlementKeys.delete, params: [id] };
  }

  async upsert(record: BillingEntitlementRecord): Promise<void> {
    LocalBillingEntitlementMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingEntitlementMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingEntitlementRecord | null> {
    const rows = await this.statements.findById.query<BillingEntitlementRecord>([id]);
    return rows[0] ?? null;
  }

  async findByBusinessAndKey(businessId: string, entitlementKey: string): Promise<BillingEntitlementRecord | null> {
    const rows = await this.statements.findByBusinessAndKey.query<BillingEntitlementRecord>([businessId, entitlementKey]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<BillingEntitlementRecord[]> {
    return this.statements.findByBusiness.query<BillingEntitlementRecord>([businessId]);
  }

  async findActiveByBusiness(businessId: string, now: number,): Promise<BillingEntitlementRecord[]> {
    return this.statements.findActiveByBusiness.query<BillingEntitlementRecord>([businessId, now, now]);
  }

  async findBySubscription(subscriptionId: string): Promise<BillingEntitlementRecord[]> {
    return this.statements.findBySubscription.query<BillingEntitlementRecord>([subscriptionId]);
  }

  async findAll(): Promise<BillingEntitlementRecord[]> {
    return this.statements.findAll.query<BillingEntitlementRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingEntitlementRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingEntitlementMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingEntitlementMapper {
  static toInsert(record: BillingEntitlementRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.subscriptionId,
      record.entitlementKey,
      record.valueJson,
      record.source,
      record.status,
      record.validFrom,
      record.validUntil,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingEntitlementRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    try { JSON.parse(record.valueJson); } catch { throw new Error("Invalid valueJson JSON."); }
  }
}

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingSubscriptionLeaseStatement } from "../../statements/billing/leases/billingSubscriptionLeaseStatements"; 
import { billingSubscriptionLeaseKeys } from "../../statements/billing/leases/billingSubscriptionLeaseStatementKey"; 
import type { BillingLeaseRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";

export interface BillingCountRow { count: number; }

export class SQLiteBillingSubscriptionLeaseRepository {
  private readonly statements: BillingSubscriptionLeaseStatement
  constructor(statements: BillingSubscriptionLeaseStatement) {
    this.statements = statements
  }

  upsertOperation(record: BillingLeaseRecord): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionLeaseKeys.upsert, params: LocalBillingSubscriptionLeaseMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionLeaseKeys.delete, params: [id] };
  }

  async upsert(record: BillingLeaseRecord): Promise<void> {
    LocalBillingSubscriptionLeaseMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingSubscriptionLeaseMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingLeaseRecord | null> {
    const rows = await this.statements.findById.query<BillingLeaseRecord>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<BillingLeaseRecord[]> {
    return this.statements.findByBusiness.query<BillingLeaseRecord>([businessId]);
  }

  async findByDevice(businessId: string, branchId: string | null, deviceId: string): Promise<BillingLeaseRecord | null> {
    const rows = await this.statements.findByDevice.query<BillingLeaseRecord>([businessId, branchId, deviceId]);
    return rows[0] ?? null;
  }

  async findActiveByBusiness(businessId: string, now: number): Promise<BillingLeaseRecord[]> {
    return this.statements.findActiveByBusiness.query<BillingLeaseRecord>([businessId, now]);
  }

  async findBySubscription(subscriptionId: string): Promise<BillingLeaseRecord[]> {
    return this.statements.findBySubscription.query<BillingLeaseRecord>([subscriptionId]);
  }

  async findExpired(now: number): Promise<BillingLeaseRecord[]> {
    return this.statements.findExpired.query<BillingLeaseRecord>([now]);
  }

  async findAll(): Promise<BillingLeaseRecord[]> {
    return this.statements.findAll.query<BillingLeaseRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingLeaseRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingSubscriptionLeaseMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingSubscriptionLeaseMapper {
  static toInsert(record: BillingLeaseRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.subscriptionId,
      record.branchId,
      record.deviceId,
      record.issuedAt,
      record.expiresAt,
      record.gracePeriodEnd,
      record.status,
      record.entitlementSnapshotJson,
      record.signedToken,
      record.revokedAt,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingLeaseRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    try { JSON.parse(record.entitlementSnapshotJson); } catch { throw new Error("Invalid entitlementSnapshotJson JSON."); }
  }
}

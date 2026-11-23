import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingSubscriptionLeaseStatement } from "../../statements/billing/leases/billingSubscriptionLeaseStatements"; 
import { billingSubscriptionLeaseKeys } from "../../statements/billing/leases/billingSubscriptionLeaseStatementKey"; 

export interface LocalBillingSubscriptionLease {
  id: string;
  businessId: string;
  subscriptionId: string;
  branchId: string | null;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  gracePeriodEnd: number | null;
  status: string;
  entitlementSnapshotJson: string;
  signedToken: string;
  revokedAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingCountRow { count: number; }

export class SQLiteBillingSubscriptionLeaseRepository {
  private readonly statements: BillingSubscriptionLeaseStatement
  constructor(statements: BillingSubscriptionLeaseStatement) {
    this.statements = statements
  }

  upsertOperation(record: LocalBillingSubscriptionLease): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionLeaseKeys.upsert, params: LocalBillingSubscriptionLeaseMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingSubscriptionLeaseKeys.delete, params: [id] };
  }

  async upsert(record: LocalBillingSubscriptionLease): Promise<void> {
    LocalBillingSubscriptionLeaseMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingSubscriptionLeaseMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<LocalBillingSubscriptionLease | null> {
    const rows = await this.statements.findById.query<LocalBillingSubscriptionLease>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<LocalBillingSubscriptionLease[]> {
    return this.statements.findByBusiness.query<LocalBillingSubscriptionLease>([businessId]);
  }

  async findByDevice(businessId: string, branchId: string | null, deviceId: string): Promise<LocalBillingSubscriptionLease | null> {
    const rows = await this.statements.findByDevice.query<LocalBillingSubscriptionLease>([businessId, branchId, deviceId]);
    return rows[0] ?? null;
  }

  async findActiveByBusiness(businessId: string, now: number): Promise<LocalBillingSubscriptionLease[]> {
    return this.statements.findActiveByBusiness.query<LocalBillingSubscriptionLease>([businessId, now]);
  }

  async findBySubscription(subscriptionId: string): Promise<LocalBillingSubscriptionLease[]> {
    return this.statements.findBySubscription.query<LocalBillingSubscriptionLease>([subscriptionId]);
  }

  async findExpired(now: number): Promise<LocalBillingSubscriptionLease[]> {
    return this.statements.findExpired.query<LocalBillingSubscriptionLease>([now]);
  }

  async findAll(): Promise<LocalBillingSubscriptionLease[]> {
    return this.statements.findAll.query<LocalBillingSubscriptionLease>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: LocalBillingSubscriptionLease[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingSubscriptionLeaseMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingSubscriptionLeaseMapper {
  static toInsert(record: LocalBillingSubscriptionLease): unknown[] {
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

  static validate(record: LocalBillingSubscriptionLease): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    try { JSON.parse(record.entitlementSnapshotJson); } catch { throw new Error("Invalid entitlementSnapshotJson JSON."); }
  }
}

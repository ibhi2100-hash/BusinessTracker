import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingPaymentStatement } from "../../statements/billing/payments/billingPaymentStatements"; 
import { billingPaymentKeys } from "../../statements/billing/payments/billingPaymentStatementKey"; 
import type { BillingPaymentRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";



export interface BillingCountRow { count: number; }

export class SQLiteBillingPaymentRepository {
  private readonly statements: BillingPaymentStatement
  constructor(statements: BillingPaymentStatement) {
    this.statements = statements
  }

  upsertOperation(record: BillingPaymentRecord): SQLiteStatementOperation {
    return { statementKey: billingPaymentKeys.upsert, params: LocalBillingPaymentMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingPaymentKeys.delete, params: [id] };
  }

  async upsert(record: BillingPaymentRecord): Promise<void> {
    LocalBillingPaymentMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingPaymentMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingPaymentRecord | null> {
    const rows = await this.statements.findById.query<BillingPaymentRecord>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<BillingPaymentRecord[]> {
    return this.statements.findByBusiness.query<BillingPaymentRecord>([businessId]);
  }

  async findByInvoice(invoiceId: string): Promise<BillingPaymentRecord[]> {
    return this.statements.findByInvoice.query<BillingPaymentRecord>([invoiceId]);
  }

  async findBySubscription(subscriptionId: string): Promise<BillingPaymentRecord[]> {
    return this.statements.findBySubscription.query<BillingPaymentRecord>([subscriptionId]);
  }

  async findByProviderReference(provider: string, providerReference: string): Promise<BillingPaymentRecord[]> {
    return this.statements.findByProviderReference.query<BillingPaymentRecord>([provider, providerReference]);
  }

  async findByStatus(businessId: string, status: string): Promise<BillingPaymentRecord[]> {
    return this.statements.findByStatus.query<BillingPaymentRecord>([businessId, status]);
  }

  async findAll(): Promise<BillingPaymentRecord[]> {
    return this.statements.findAll.query<BillingPaymentRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingPaymentRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingPaymentMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingPaymentMapper {
  static toInsert(record: BillingPaymentRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.subscriptionId,
      record.invoiceId,
      record.provider,
      record.providerReference,
      record.method,
      record.status,
      record.currency,
      record.amountMinor,
      record.refundedMinor,
      record.initiatedAt,
      record.confirmedAt,
      record.failedAt,
      record.reversedAt,
      record.refundedAt,
      record.failureReason,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingPaymentRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
  }
}

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingPaymentStatement } from "../../statements/billing/payments/billingPaymentStatements"; 
import { billingPaymentKeys } from "../../statements/billing/payments/billingPaymentStatementKey"; 

export interface LocalBillingPayment {
  id: string;
  businessId: string;
  subscriptionId: string | null;
  invoiceId: string | null;
  provider: string | null;
  providerReference: string | null;
  method: string | null;
  status: string;
  currency: string;
  amountMinor: number;
  refundedMinor: number;
  initiatedAt: number | null;
  confirmedAt: number | null;
  failedAt: number | null;
  reversedAt: number | null;
  refundedAt: number | null;
  failureReason: string | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingCountRow { count: number; }

export class SQLiteBillingPaymentRepository {
  private readonly statements: BillingPaymentStatement
  constructor(statements: BillingPaymentStatement) {
    this.statements = statements
  }

  upsertOperation(record: LocalBillingPayment): SQLiteStatementOperation {
    return { statementKey: billingPaymentKeys.upsert, params: LocalBillingPaymentMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingPaymentKeys.delete, params: [id] };
  }

  async upsert(record: LocalBillingPayment): Promise<void> {
    LocalBillingPaymentMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingPaymentMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<LocalBillingPayment | null> {
    const rows = await this.statements.findById.query<LocalBillingPayment>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<LocalBillingPayment[]> {
    return this.statements.findByBusiness.query<LocalBillingPayment>([businessId]);
  }

  async findByInvoice(invoiceId: string): Promise<LocalBillingPayment[]> {
    return this.statements.findByInvoice.query<LocalBillingPayment>([invoiceId]);
  }

  async findBySubscription(subscriptionId: string): Promise<LocalBillingPayment[]> {
    return this.statements.findBySubscription.query<LocalBillingPayment>([subscriptionId]);
  }

  async findByProviderReference(provider: string, providerReference: string): Promise<LocalBillingPayment[]> {
    return this.statements.findByProviderReference.query<LocalBillingPayment>([provider, providerReference]);
  }

  async findByStatus(businessId: string, status: string): Promise<LocalBillingPayment[]> {
    return this.statements.findByStatus.query<LocalBillingPayment>([businessId, status]);
  }

  async findAll(): Promise<LocalBillingPayment[]> {
    return this.statements.findAll.query<LocalBillingPayment>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: LocalBillingPayment[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingPaymentMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingPaymentMapper {
  static toInsert(record: LocalBillingPayment): unknown[] {
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

  static validate(record: LocalBillingPayment): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    if (!Number.isSafeInteger(record.amountMinor) || record.amountMinor < 0) throw new Error("Invalid amountMinor.");
    if (!Number.isSafeInteger(record.refundedMinor) || record.refundedMinor < 0) throw new Error("Invalid refundedMinor.");
  }
}

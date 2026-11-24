import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { BillingInvoiceStatement } from "../../statements/billing/invoices/billingInvoiceStatements"; 
import { billingInvoiceKeys } from "../../statements/billing/invoices/billingInvoiceStatementKey";
import type { BillingInvoiceRecord } from "../../../../../services/ApplicationService/API/billing/billingplanApi";


export interface BillingCountRow { count: number; }

export class SQLiteBillingInvoiceRepository {
  private readonly statements: BillingInvoiceStatement
  constructor(statements: BillingInvoiceStatement) {
    this.statements = statements
  }

  upsertOperation(record: BillingInvoiceRecord): SQLiteStatementOperation {
    return { statementKey: billingInvoiceKeys.upsert, params: LocalBillingInvoiceMapper.toInsert(record) };
  }

  deleteOperation(id: string): SQLiteStatementOperation {
    return { statementKey: billingInvoiceKeys.delete, params: [id] };
  }

  async upsert(record: BillingInvoiceRecord): Promise<void> {
    LocalBillingInvoiceMapper.validate(record);
    await this.statements.upsert.execute(LocalBillingInvoiceMapper.toInsert(record));
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async findById(id: string): Promise<BillingInvoiceRecord| null> {
    const rows = await this.statements.findById.query<BillingInvoiceRecord>([id]);
    return rows[0] ?? null;
  }

  async findByBusiness(businessId: string): Promise<BillingInvoiceRecord[]> {
    return this.statements.findByBusiness.query<BillingInvoiceRecord>([businessId]);
  }

  async findBySubscription(subscriptionId: string): Promise<BillingInvoiceRecord[]> {
    return this.statements.findBySubscription.query<BillingInvoiceRecord>([subscriptionId]);
  }

  async findByNumber(businessId: string, invoiceNumber: string): Promise<BillingInvoiceRecord | null> {
    const rows = await this.statements.findByNumber.query<BillingInvoiceRecord>([businessId, invoiceNumber]);
    return rows[0] ?? null;
  }

  async findByStatus(businessId: string, status: string): Promise<BillingInvoiceRecord[]> {
    return this.statements.findByStatus.query<BillingInvoiceRecord>([businessId, status]);
  }

  async findOverdue(businessId: string, now: number): Promise<BillingInvoiceRecord[]> {
    return this.statements.findOverdue.query<BillingInvoiceRecord>([businessId, now]);
  }

  async findAll(): Promise<BillingInvoiceRecord[]> {
    return this.statements.findAll.query<BillingInvoiceRecord>([]);
  }

  async countAll(): Promise<number> {
    const rows = await this.statements.count.query<BillingCountRow>([]);
    return Number(rows[0]?.count ?? 0);
  }

  syncOperations(records: BillingInvoiceRecord[]): SQLiteStatementOperation[] {
    for (const record of records) LocalBillingInvoiceMapper.validate(record);
    return records.map((record) => this.upsertOperation(record));
  }
}

export class LocalBillingInvoiceMapper {
  static toInsert(record: BillingInvoiceRecord): unknown[] {
    return [
      record.id,
      record.businessId,
      record.subscriptionId,
      record.invoiceNumber,
      record.status,
      record.currency,
      record.subtotalMinor,
      record.taxMinor,
      record.discountMinor,
      record.totalMinor,
      record.amountPaidMinor,
      record.amountDueMinor,
      record.periodStart,
      record.periodEnd,
      record.issuedAt,
      record.dueAt,
      record.paidAt,
      record.aggregateVersion,
      record.lastEventId,
      record.createdAt,
      record.updatedAt
    ];
  }

  static validate(record: BillingInvoiceRecord): void {
    if (!record.id || !record.businessId) throw new Error("Billing projection requires id and businessId.");
    if (!Number.isSafeInteger(record.aggregateVersion) || record.aggregateVersion < 0) throw new Error("Invalid aggregateVersion.");
    if (!Number.isSafeInteger(record.createdAt) || !Number.isSafeInteger(record.updatedAt)) throw new Error("Invalid billing projection timestamps.");
    if (!Number.isSafeInteger(record.subtotalMinor) || record.subtotalMinor < 0) throw new Error("Invalid subtotalMinor.");
    if (!Number.isSafeInteger(record.taxMinor) || record.taxMinor < 0) throw new Error("Invalid taxMinor.");
    if (!Number.isSafeInteger(record.discountMinor) || record.discountMinor < 0) throw new Error("Invalid discountMinor.");
    if (!Number.isSafeInteger(record.totalMinor) || record.totalMinor < 0) throw new Error("Invalid totalMinor.");
    if (!Number.isSafeInteger(record.amountPaidMinor) || record.amountPaidMinor < 0) throw new Error("Invalid amountPaidMinor.");
    if (!Number.isSafeInteger(record.amountDueMinor) || record.amountDueMinor < 0) throw new Error("Invalid amountDueMinor.");
  }
}

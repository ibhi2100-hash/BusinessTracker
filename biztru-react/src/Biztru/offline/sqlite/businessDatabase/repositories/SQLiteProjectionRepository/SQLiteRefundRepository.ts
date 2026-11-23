import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol"; 
import type { RefundProjection, RefundItem, RefundPayment } from "@business/shared-types"; 
import { RefundStatement } from "../../statements/refund/refundsStatements";
import { refundsKeys } from "../../statements/refund/refundsStatementKeys";

export interface RefundListFilters {
  businessId: string;
  branchId?: string | null;
  originalSaleId?: string | null;
  from?: number | null;
  to?: number | null;
  status?: string | "all";
  limit?: number;
  offset?: number;
}

export class SQLiteRefundRepository {
  private readonly statements: RefundStatement
  constructor(statements: RefundStatement) {
    this.statements = statements
  }

  refundOperation(refund: RefundProjection): SQLiteStatementOperation {
    return { statementKey: refundsKeys.refundUpsert, params: RefundMapper.toRefundInsert(refund) };
  }

  itemOperation(item: RefundItem): SQLiteStatementOperation {
    return { statementKey: refundsKeys.refundItemUpsert, params: RefundMapper.toItemInsert(item) };
  }

  paymentOperation(payment: RefundPayment): SQLiteStatementOperation {
    return { statementKey: refundsKeys.refundPaymentUpsert, params: RefundMapper.toPaymentInsert(payment) };
  }

  async upsert(refund: RefundProjection): Promise<void> {
    await this.statements.refundUpsert.execute(RefundMapper.toRefundInsert(refund));
    for (const item of refund.items) {
      await this.statements.refundItemUpsert.execute(RefundMapper.toItemInsert(item));
    }
    for (const payment of refund.payments) {
      await this.statements.refundPaymentUpsert.execute(RefundMapper.toPaymentInsert(payment));
    }
  }

  async findById(id: string): Promise<RefundProjection | null> {
    const rows = await this.statements.findRefundById.query<any>([id]);
    if (!rows[0]) return null;
    const [items, payments] = await Promise.all([
      this.statements.findRefundItems.query<RefundItem>([id]),
      this.statements.findRefundPayments.query<RefundPayment>([id]),
    ]);
    return { ...rows[0], items, payments };
  }

  async findBySale(businessId: string, originalSaleId: string): Promise<RefundProjection[]> {
    const rows = await this.statements.findRefundsBySale.query<any>([businessId, originalSaleId]);
    return Promise.all(rows.map(async row => {
      const [items, payments] = await Promise.all([
        this.statements.findRefundItems.query<RefundItem>([row.id]),
        this.statements.findRefundPayments.query<RefundPayment>([row.id]),
      ]);
      return { ...row, items, payments };
    }));
  }

  async list(filters: RefundListFilters): Promise<RefundProjection[]> {
    if (!filters.businessId) throw new Error("Refund list requires businessId");
    const branch = filters.branchId ?? null;
    const sale = filters.originalSaleId ?? null;
    const from = filters.from ?? null;
    const to = filters.to ?? null;
    const status = filters.status ?? "all";
    const limit = Math.min(Math.max(Math.floor(filters.limit ?? 100), 1), 500);
    const offset = Math.max(Math.floor(filters.offset ?? 0), 0);

    const rows = await this.statements.listRefunds.query<any>([
      filters.businessId, branch, branch, sale, sale, from, from, to, to,
      status, status, limit, offset,
    ]);

    return Promise.all(rows.map(async row => {
      const [items, payments] = await Promise.all([
        this.statements.findRefundItems.query<RefundItem>([row.id]),
        this.statements.findRefundPayments.query<RefundPayment>([row.id]),
      ]);
      return { ...row, items, payments };
    }));
  }

  async summary(filters: { businessId: string; from: number; to: number; branchId?: string | null }) {
    if (!filters.businessId) throw new Error("Refund summary requires businessId");
    const branch = filters.branchId ?? null;
    const rows = await this.statements.summaryByDateRange.query<any>([
      filters.businessId, filters.from, filters.to, branch, branch,
    ]);
    return rows[0] ?? { completedRefundAmount: 0, completedRefundCount: 0, pendingRefundAmount: 0 };
  }
}

export class RefundMapper {
  static toRefundInsert(r: RefundProjection): unknown[] {
    return [
      r.id, r.businessId, r.branchId, r.originalSaleId, r.refundNumber,
      r.customerId ?? null, r.customerRef ?? null, r.reason ?? null, r.status,
      r.refundMethod ?? null, r.subtotal, r.taxAmount, r.totalAmount,
      r.userId ?? null, r.approvedBy ?? null, r.mode, r.createdAt,
      r.completedAt ?? null, r.updatedAt ?? r.createdAt,
    ];
  }

  static toItemInsert(i: RefundItem): unknown[] {
    return [
      i.id, i.refundId, i.businessId, i.branchId, i.originalSaleId,
      i.saleItemId ?? null, i.productId, i.productName ?? null, i.quantity,
      i.unitPrice, i.unitCostPrice, i.lineRefundAmount, i.lineCostAmount,
      i.inventoryDisposition, i.createdAt,
    ];
  }

  static toPaymentInsert(p: RefundPayment): unknown[] {
    return [
      p.id, p.refundId, p.businessId, p.branchId, p.paymentMethod,
      p.amount, p.status, p.reference ?? null, p.createdAt, p.completedAt ?? null,
    ];
  }
}

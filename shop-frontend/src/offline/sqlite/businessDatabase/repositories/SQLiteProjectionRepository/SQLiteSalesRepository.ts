// ============================================================
// SQLiteSalesRepository.ts
// ============================================================
import { Sales } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { SalesStatement } from "../../statements/sales/salesStatements";

export interface SalesListFilters {
  branchId?: string | null;
  businessId?: string | null;
  productId?: string;
  from?: string;
  to?: string;
  status?: string | null;
  limit?: number;
  offset?: number;
}

export interface SalesSummaryRow {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalQuantity: number;
  transactionCount: number;
  voidedCount: number;
  refundedAmount: number;
}

export class SQLiteSalesRepository
  implements IProjectionEntityRepository<Sales>
{
  constructor(private readonly statements: SalesStatement) {}

  async upsert(state: Sales): Promise<void> {
    await this.statements.upsert.execute(SalesMapper.toInsert(state));
  }

  async findById(id: string): Promise<Sales | null> {
    const rows = await this.statements.findById.query<Sales>([id]);
    return rows[0] ?? null;
  }

  async findAll(): Promise<Sales[]> {
    return this.statements.findAll.query<Sales>([]);
  }

  async findByBranch(branchId: string): Promise<Sales[]> {
    return this.statements.findByBranch.query<Sales>([branchId]);
  }

  async findByProduct(productId: string): Promise<Sales[]> {
    return this.statements.findByProduct.query<Sales>([productId]);
  }

  async findByGroup(saleGroupId: string): Promise<Sales[]> {
    return this.statements.findByGroup.query<Sales>([saleGroupId]);
  }

  async list(filters: SalesListFilters = {}): Promise<Sales[]> {
    const from = filters.from ?? "1970-01-01T00:00:00.000Z";
    const to = filters.to ?? "9999-12-31T23:59:59.999Z";
    const branchId = filters.branchId ?? null;
    const status = filters.status && filters.status !== "all"
      ? filters.status
      : null;
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    return this.statements.findByDateRange.query<Sales>([
      from,
      to,
      branchId,
      branchId,
      status,
      status,
      limit,
      offset,
    ]);
  }

  async summary(filters: {
    from?: string;
    to?: string;
    branchId?: string | null;
  } = {}): Promise<SalesSummaryRow> {
    const from = filters.from ?? "1970-01-01T00:00:00.000Z";
    const to = filters.to ?? "9999-12-31T23:59:59.999Z";
    const branchId = filters.branchId ?? null;

    const rows = await this.statements.summaryByDateRange.query<SalesSummaryRow>([
      from,
      to,
      branchId,
      branchId,
    ]);

    return (
      rows[0] ?? {
        totalSales: 0,
        totalCost: 0,
        totalProfit: 0,
        totalQuantity: 0,
        transactionCount: 0,
        voidedCount: 0,
        refundedAmount: 0,
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.statements.delete.execute([id]);
  }

  async update(state: Sales): Promise<void> {
    await this.statements.update.execute(SalesMapper.toUpdate(state));
  }
}

export class SalesMapper {
  static toInsert(sale: Sales): unknown[] {
    return [
      sale.id,
      sale.businessId ?? "",
      sale.branchId ?? "",
      sale.productId,
      sale.productName ?? "",
      sale.quantity,
      sale.price,
      sale.costPrice,
      sale.total,
      sale.profit ?? sale.total - sale.costPrice,
      sale.paymentMethod ?? "",
      sale.customerRef ?? "",
      sale.note ?? "",
      sale.status ?? "completed",
      sale.saleGroupId ?? "",
      sale.mode ?? "LIVE",
      sale.createdAt,
      sale.updatedAt ?? sale.createdAt,
    ];
  }

  static toUpdate(sale: Sales): unknown[] {
    return [
      sale.quantity,
      sale.price,
      sale.costPrice,
      sale.total,
      sale.profit ?? sale.total - sale.costPrice,
      sale.status ?? "completed",
      sale.note ?? "",
      sale.updatedAt ?? new Date().toISOString(),
      sale.id,
    ];
  }
}
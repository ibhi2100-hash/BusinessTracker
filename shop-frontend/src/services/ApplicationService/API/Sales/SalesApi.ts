import { BusinessManager } from "@/src/Composer/BusinessManager";
import { AggregateType } from "@/offline/domain/aggregate";
import { Sales, salesEventType } from "@business/shared-types";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { Command } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type SaleMode = "OPENING" | "LIVE";

export interface SaleLinePayload {
  productId: string;
  productName?: string;
  quantity: number;
  /** Selling price × quantity */
  amount: number;
  /** Cost price × quantity */
  costPrice: number;
  unitPrice?: number;
  unitCost?: number;
}

export interface CreateSaleRequest {
  aggregateType?: AggregateType;
  /** Unique sale / line id. Prefer a dedicated saleId, not productId. */
  aggregateId: string;
  type?: typeof salesEventType.SALE_ADDED;
  mode: SaleMode;
  payload: SaleLinePayload & {
    branchId?: string;
    businessId?: string;
    note?: string;
    paymentMethod?: "cash" | "transfer" | "card" | "other";
    customerRef?: string;
  };
}

export interface CreateBatchSaleRequest {
  mode: SaleMode;
  /** One shared checkout id for the whole cart */
  saleId?: string;
  branchId?: string;
  businessId?: string;
  paymentMethod?: "cash" | "transfer" | "card" | "other";
  customerRef?: string;
  note?: string;
  lines: SaleLinePayload[];
}

export interface VoidSaleRequest {
  saleId: string;
  mode: SaleMode;
  reason?: string;
  branchId?: string;
}

export interface RefundSaleRequest {
  saleId: string;
  mode: SaleMode;
  /** Partial or full refund amount (money returned) */
  amount: number;
  /** Optional cost of goods returned */
  costPrice?: number;
  quantity?: number;
  productId?: string;
  reason?: string;
  branchId?: string;
}

export interface SaleFilters {
  branchId?: string;
  businessId?: string;
  productId?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
  status?: "completed" | "voided" | "refunded" | "all";
  limit?: number;
  offset?: number;
}

export interface SaleReadModel {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  amount: number;
  costPrice: number;
  profit: number;
  paymentMethod?: string;
  customerRef?: string;
  note?: string;
  status: "completed" | "voided" | "refunded";
  branchId?: string;
  businessId?: string;
  createdAt: string;
  mode: SaleMode;
}

export interface SalesSummary {
  totalSales: number;      // revenue
  totalCost: number;
  totalProfit: number;
  totalQuantity: number;
  transactionCount: number;
  voidedCount: number;
  refundedAmount: number;
  from?: string;
  to?: string;
}

export interface ProductSalesSummary {
  productId: string;
  productName?: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  transactionCount: number;
}

/* ------------------------------------------------------------------ */
/*  SalesApi                                                          */
/* ------------------------------------------------------------------ */

export class SalesApi {
  constructor(private readonly manager: BusinessManager) {}

  /* ================================================================ */
  /*  WRITE – Commands                                                */
  /* ================================================================ */

  /**
   * Record a single sale line (quick-sell or one cart item).
   * Emits SALE_ADDED and updates inventory + financial projections.
   */
  async createSale(request: CreateSaleRequest): Promise<{ saleId: string }> {
    const saleId = request.aggregateId || crypto.randomUUID();

    const quantity = Math.max(0, Math.floor(request.payload.quantity));
    const amount = Number(request.payload.amount) || 0;
    const costPrice = Number(request.payload.costPrice) || 0;

    if (quantity <= 0) {
      throw new Error("Sale quantity must be greater than zero");
    }
    if (amount < 0 || costPrice < 0) {
      throw new Error("Amount and costPrice cannot be negative");
    }
    const app = await this.manager.current();

    const salesIntent: CommandIntent<any> = {
      aggregateType: request.aggregateType ?? AggregateType.SALE,
      aggregateId: saleId,
      type: request.type ?? salesEventType.SALE_ADDED,
      mode: request.mode,
      payload: {
        ...request.payload,
        productId: request.payload.productId,
        quantity,
        amount,
        costPrice,
        unitPrice:
          request.payload.unitPrice ??
          (quantity > 0 ? amount / quantity : 0),
        unitCost:
          request.payload.unitCost ??
          (quantity > 0 ? costPrice / quantity : 0),
        profit: amount - costPrice,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    };
    const salesCommand = await app.domain.commandFactory.create(salesIntent);

    await app.domain.kernel.execute(salesCommand)
    return { saleId };
  }

  /**
   * Checkout a whole cart as one logical sale (multiple lines).
   * Each line gets its own event; they share the same saleId group.
   */
  async createBatchSale(
    request: CreateBatchSaleRequest
  ): Promise<{ saleId: string; lineIds: string[] }> {
    if (!request.lines?.length) {
      throw new Error("Batch sale requires at least one line");
    }

    const saleId = request.saleId || crypto.randomUUID();
    const lineIds: string[] = [];

    for (const line of request.lines) {
      const lineId = crypto.randomUUID();
      lineIds.push(lineId);

      await this.createSale({
        aggregateId: lineId,
        mode: request.mode,
        payload: {
          ...line,
          branchId: request.branchId,
          businessId: request.businessId,
          paymentMethod: request.paymentMethod,
          customerRef: request.customerRef,
          note: request.note,
          // group key so read models can reconstruct the full checkout
          saleGroupId: saleId,
        } as any,
      });
    }

    return { saleId, lineIds };
  }

  /**
   * Void an entire sale (financial reversal).
   * Prefer void over delete so the audit trail stays intact.
   */
  async voidSale(request: VoidSaleRequest): Promise<void> {


    const voidSalesIntent: CommandIntent<any> = {
      aggregateType: AggregateType.SALE,
      aggregateId: request.saleId,
      type: salesEventType.SALE_VOIDED ?? "SALE_VOIDED",
      mode: request.mode,
      payload: {
        saleId: request.saleId,
        reason: request.reason ?? "Voided by user",
        branchId: request.branchId,
        voidedAt: new Date().toISOString(),
        status: "voided",
      },
    };

    const app = await this.manager.current();

    const voidSalesCommand = await app.domain.commandFactory.create(voidSalesIntent);

    await app.domain.kernel.execute(voidSalesCommand)
  }

  /**
   * Partial or full refund against a completed sale.
   * Tracks money returned and optional stock return cost.
   */
  async refundSale(request: RefundSaleRequest): Promise<{ refundId: string }> {
    if (request.amount <= 0) {
      throw new Error("Refund amount must be greater than zero");
    }

    const refundId = crypto.randomUUID();

        const  refundIntent: CommandIntent<any> = {
            aggregateType: AggregateType.SALE,
            aggregateId: request.saleId,
            type: salesEventType.SALE_REFUNDED ?? "SALE_REFUNDED",
            mode: request.mode,
            payload: {
                refundId,
                saleId: request.saleId,
                amount: request.amount,
                costPrice: request.costPrice ?? 0,
                quantity: request.quantity ?? 0,
                productId: request.productId,
                reason: request.reason ?? "Customer refund",
                branchId: request.branchId,
                refundedAt: new Date().toISOString(),
                status: "refunded",
            },
            };

        const app = await this.manager.current();

        const refundCommand = await app.domain.commandFactory.create(refundIntent);

        await app.domain.kernel.execute(refundCommand)

    return { refundId };
  }

  /* ================================================================ */
  /*  READ – Local machine read models / projections                  */
  /* ================================================================ */

  /**
   * Single sale line by id (from local SQLite / projection store).
   */
  async getSale(saleId: string): Promise<Sales| null> {
    const app = await this.manager.current();
    return await app.storage.repositories.sales.findById(saleId);
  }

  /**
   * List sales with filters (branch, date range, product, status).
   * Reads from the local projection – fast, offline-capable.
   */
  async listSales(filters: SaleFilters = {}): Promise<Sales[]> {
    const app = await this.manager.current();
    const list = await app.storage.repositories.sales.list({
      branchId: filters.branchId,
      businessId: filters.businessId,
      productId: filters.productId,
      from: filters.from,
      to: filters.to,
      status: filters.status ?? "all",
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0,
    });

    const allSales = await app.storage.repositories.sales.getAllSales();

    console.log("This are all the sales that actually happen in the business: ", allSales)

    return list
  }

  /**
   * All sales that belong to one checkout / cart (saleGroupId).
   */
  async getSaleGroup(saleGroupId: string): Promise<Sales[]> {
    const app = await this.manager.current();

    const salesGroup = await app.storage.repositories.sales.findByGroup(saleGroupId);

    return salesGroup
  }

  /**
   * Financial summary for a period (revenue, cost, profit, counts).
   * Primary control panel / end-of-day number.
   */
  async getSalesSummary(filters: {
    branchId?: string;
    businessId?: string;
    from?: string;
    to?: string;
  } = {}): Promise<SalesSummary> {
    const rows = await this.listSales({
      ...filters,
      status: "all",
      limit: 10_000,
    });

    let totalSales = 0;
    let totalCost = 0;
    let totalQuantity = 0;
    let transactionCount = 0;
    let voidedCount = 0;
    let refundedAmount = 0;

    for (const row of rows) {
      if (row.status === "voided") {
        voidedCount += 1;
        continue;
      }

      if (row.status === "refunded") {
        refundedAmount += row.total;
        // refunds reduce net revenue
        totalSales -= row.total;
        totalCost -= row.costPrice;
        continue;
      }

      // completed
      totalSales += row.total;
      totalCost += row.costPrice;
      totalQuantity += row.quantity;
      transactionCount += 1;
    }

    return {
      totalSales,
      totalCost,
      totalProfit: totalSales - totalCost,
      totalQuantity,
      transactionCount,
      voidedCount,
      refundedAmount,
      from: filters.from,
      to: filters.to,
    };
  }

  /**
   * Per-product sales performance (quantity, revenue, profit).
   * Useful for ranking products and stock decisions.
   */
  async getProductSalesSummary(filters: {
    branchId?: string;
    from?: string;
    to?: string;
  } = {}): Promise<ProductSalesSummary[]> {
    const rows = await this.listSales({
      ...filters,
      status: "completed",
      limit: 10_000,
    });

    const map = new Map<string, ProductSalesSummary>();

    for (const row of rows) {
      const existing = map.get(row.productId) ?? {
        productId: row.productId,
        productName: row.productName,
        quantitySold: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        transactionCount: 0,
      };

      existing.quantitySold += row.quantity;
      existing.revenue += row.total;
      existing.cost += row.costPrice;
      existing.profit += row.total - row.costPrice;
      existing.transactionCount += 1;

      map.set(row.productId, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Today’s live numbers for the active branch (dashboard widgets).
   */
  async getTodaySummary(branchId?: string): Promise<SalesSummary> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.getSalesSummary({
      branchId,
      from: start.toISOString(),
      to: end.toISOString(),
    });
  }

  /**
   * Gross margin % for a period (financial control KPI).
   */
  async getGrossMargin(filters: {
    branchId?: string;
    from?: string;
    to?: string;
  } = {}): Promise<{ marginPercent: number; summary: SalesSummary }> {
    const summary = await this.getSalesSummary(filters);
    const marginPercent =
      summary.totalSales > 0
        ? (summary.totalProfit / summary.totalSales) * 100
        : 0;

    return { marginPercent, summary };
  }

}
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { AggregateType } from "@/offline/domain/aggregate";
import { BuyingAnalysisRow, Sales, salesEventType } from "@business/shared-types";
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
  unitCostPrice?: number;
}

export interface BuyAnalysisPayload {
  businessId: string,
  branchId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
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
  businessId: string;
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

export class ExpenseApi {
  constructor(private readonly manager: BusinessManager) {}

  /* ================================================================ */
  /*  WRITE – Commands                                                */
  /* ================================================================ */

  /**
   * Record a single sale line (quick-sell or one cart item).
   * Emits SALE_ADDED and updates inventory + financial projections.
   */
  async recordExpense(expense: any) {

  }

}
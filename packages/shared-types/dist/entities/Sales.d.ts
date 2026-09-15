import { Mode } from "../enums/Mode";
/**
 * Sales read-model / projection entity.
 *
 * One row = one sold line (quick-sell or cart line).
 * Multiple lines that were checked out together share the same `saleGroupId`.
 */
export type SaleStatus = "completed" | "voided" | "refunded";
export type PaymentMethod = "cash" | "transfer" | "card" | "other";
export interface Sales {
    id: string;
    businessId: string;
    branchId: string | null;
    productId: string;
    productName: string | null;
    quantity: number;
    unitCostPrice: number;
    unitPrice: number;
    price: number;
    costPrice: number;
    total: number;
    profit: number;
    userId: string | null;
    customerId: string | null;
    customerRef: string | null;
    invoiceId: string | null;
    paymentMethod: PaymentMethod | null;
    note: string | null;
    status: SaleStatus;
    saleGroupId: string | null;
    mode: Mode;
    createdAt: number;
    updatedAt: number | null;
}
export interface BuyingAnalysisRow {
    productId: string;
    productName: string;
    currentStock: number;
    reorderLevel: number;
    unitsSold: number;
    salesVelocity: number;
    grossProfit: number;
    grossProfitVelocity: number;
    previousUnitsSold: number;
    previousSalesVelocity: number;
    demandGrowth: number;
    salesVelocityScore: number;
    grossProfitVelocityScore: number;
    demandTrendScore: number;
    inventoryPressureScore: number;
    confidenceScore: number;
    buyingScore: number;
}

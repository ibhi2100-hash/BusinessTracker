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
    /** Unique id for this sale line */
    id: string;
    businessId?: string;
    branchId?: string;
    /** Product that was sold */
    productId: string;
    productName?: string;
    /** Units sold on this line */
    quantity: number;
    /**
     * Unit selling price (₦ per unit).
     * Line revenue = price × quantity  →  stored in `total`
     */
    price: number;
    /**
     * Unit cost (₦ per unit) × quantity, i.e. total cost for this line.
     * Kept as a line total so profit is simply total - costPrice.
     */
    costPrice: number;
    /**
     * Line revenue = price × quantity
     */
    total: number;
    /**
     * Line profit = total - costPrice
     */
    profit: number;
    /** Who recorded the sale */
    userId?: string;
    /** Optional customer / walk-in reference */
    customerId?: string;
    customerRef?: string;
    /** Optional invoice / receipt number */
    invoiceId?: string;
    paymentMethod?: PaymentMethod;
    note?: string;
    /**
     * Lifecycle for financial control:
     * - completed → counts toward revenue
     * - voided    → reversed, excluded from totals
     * - refunded  → money returned, reduces net revenue
     */
    status: SaleStatus;
    /**
     * Shared id for every line in the same cart checkout.
     * Empty / undefined for single quick-sell.
     */
    saleGroupId?: string;
    mode: Mode;
    /** Unix ms or ISO — keep one convention app-wide. Prefer number (ms). */
    createdAt: number;
    updatedAt: number;
}

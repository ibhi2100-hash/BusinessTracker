import { DomainEvent, Sales, Mode, PaymentMethod } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface SaleAddedPayload {
    productId: string;
    productName: string;
    /** Unit sell price */
    unitCostPrice: number;
    unitPrice: number;
    costPrice: number;
    quantity: number;
    /** Optional precomputed line total (price × quantity) */
    amount: number;
    total: number;
    paymentMethod: PaymentMethod;
    customerId: string | null;
    customerRef: string | null;
    invoiceId: string | null;
    note: string | null;
    saleGroupId: string | null;
    mode?: Mode;
    /** If true, costPrice is already line total (unit × qty) */
    costIsLineTotal?: boolean;
}
interface SaleVoidedPayload {
    saleId?: string;
    reason?: string;
}
interface SaleRefundedPayload {
    saleId?: string;
    /** Money returned to customer */
    amount: number;
    /** Cost portion of refunded goods (optional) */
    costPrice?: number;
    quantity?: number;
    productId?: string;
    reason?: string;
}
type SalesEventPayload = SaleAddedPayload | SaleVoidedPayload | SaleRefundedPayload;
export declare class SalesReducer implements ProjectionReducer<Sales, DomainEvent> {
    reduce(state: Sales | null, event: DomainEvent<SalesEventPayload>): Sales;
    private onSaleAdded;
    private onSaleVoided;
    private onSaleRefunded;
}
export {};

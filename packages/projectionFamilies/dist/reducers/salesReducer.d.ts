import { DomainEvent, Sales, Mode, PaymentMethod } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface SaleAddedPayload {
    productId: string;
    productName?: string;
    /** Unit sell price */
    price: number;
    /**
     * Either unit cost or line cost — reducer normalises to line cost.
     * Prefer sending unit cost + quantity; total cost = unitCost * quantity.
     */
    costPrice: number;
    quantity: number;
    /** Optional precomputed line total (price × quantity) */
    amount?: number;
    total?: number;
    paymentMethod?: PaymentMethod;
    customerId?: string;
    customerRef?: string;
    invoiceId?: string;
    note?: string;
    saleGroupId?: string;
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

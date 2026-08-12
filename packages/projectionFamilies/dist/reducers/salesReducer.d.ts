import { DomainEvent, Sales } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface SalesPayload {
    id: string;
    productId: string;
    price: number;
    costPrice: number;
    quantity: number;
    total: number;
}
export declare class SalesReducer implements ProjectionReducer<Sales, DomainEvent> {
    reduce(state: Sales | null, event: DomainEvent<SalesPayload>): Sales;
    private created;
}
export {};

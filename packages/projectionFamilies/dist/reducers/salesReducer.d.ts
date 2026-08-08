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
export declare class SalesReducer implements ProjectionReducer<Sales, DomainEvent<SalesPayload>> {
    reduce(state: Sales, event: DomainEvent<SalesPayload>): Sales;
}
export {};

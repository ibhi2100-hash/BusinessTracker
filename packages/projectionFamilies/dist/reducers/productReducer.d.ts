import { DomainEvent, Product } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
export declare class ProductReducer implements ProjectionReducer<Product, DomainEvent> {
    reduce(state: Product | null, event: DomainEvent): Product;
    private created;
    private update;
    private deleted;
    private inventoryReceived;
    private requireState;
}

import { DomainEvent, Product } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
export interface ProductPayload {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    sku: string | null;
    barcode: string | null;
    category: string | null;
    costPrice: number;
    reorderLevel: number | null;
    price: number;
}
export declare class ProductReducer implements ProjectionReducer<Product, DomainEvent> {
    reduce(state: Product | null, event: DomainEvent): Product;
    private created;
    private update;
    private deleted;
    private inventoryReceived;
    private requireState;
}

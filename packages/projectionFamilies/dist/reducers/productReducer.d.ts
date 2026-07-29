import { DomainEvent, Product } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface ProductPayload {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    costPrice: number;
    price: number;
}
export declare class ProductReducer implements ProjectionReducer<Product, DomainEvent<ProductPayload>> {
    reduce(state: Product, event: DomainEvent<ProductPayload>): Product;
}
export declare const Producteducer: {
    initialState: () => {
        id: string;
        businessId: string;
        branchId: string;
        name: string;
        imageUrl: string;
        description: string;
        costPrice: number;
        price: number;
        isDeleted: boolean;
    };
    reduce(current: any, event: IntegrationEvent): Product | null;
};
export {};

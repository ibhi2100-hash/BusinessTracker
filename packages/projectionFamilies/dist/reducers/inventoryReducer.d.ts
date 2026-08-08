import { Inventory } from "@business/shared-types";
import { DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface InventoryPayload {
    id: string;
    productId: string;
    quantity: number;
    costPrice: number;
    direction?: "increase" | "decrease";
}
export declare class InventoryReducer implements ProjectionReducer<Inventory, DomainEvent<InventoryPayload>> {
    reduce(state: Inventory, event: DomainEvent<InventoryPayload>): Inventory;
}
export {};

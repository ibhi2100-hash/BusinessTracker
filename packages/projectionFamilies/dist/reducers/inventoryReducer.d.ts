import { Inventory, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer.js";
export interface InventoryPayload {
    productId: string;
    quantity: number;
}
export interface CreateInventoryPayload extends InventoryPayload {
    id: string;
    costPrice: number;
}
export interface ReceivePayload extends InventoryPayload {
    costPrice: number;
    note?: string;
}
export interface AdjustPayload extends InventoryPayload {
    direction: "increase" | "decrease";
}
export declare class InventoryReducer implements ProjectionReducer<Inventory, DomainEvent> {
    reduce(state: Inventory | null, event: DomainEvent): Inventory;
    private created;
    private add;
    private update;
    private receive;
    private adjust;
    private transfer;
    private sell;
    private requireState;
}

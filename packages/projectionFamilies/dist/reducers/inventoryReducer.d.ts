import { Inventory, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
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

import { EventConsumer } from "@business/event-bus";
import {  DomainEvent, InventoryEventType, salesEventType } from "@business/shared-types";
import {  InventoryReducer } from "@business/projection-families";
import { SQLiteInventoryRepository } from "../repositories/SQLiteProjectionRepository/SQLiteInventoryRepository";
import { changeNotifier } from "./changeNoifier";

export class InventoryConsumer
implements EventConsumer<DomainEvent> {

    readonly name = "inventories"
    constructor(
        private readonly repostory: SQLiteInventoryRepository

    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case InventoryEventType.INVENTORY_ADDED:
                    const inventory = new InventoryReducer().reduce(null, event)
                    await this.repostory.upsert(inventory)
                    changeNotifier.notify(["inventories"])
                    break

                case salesEventType.SALE_ADDED:
                    const currentInventory = await this.repostory.findProductId(event.payload.productId);

                    const saleInventory = new InventoryReducer().reduce(currentInventory, event);

                    await this.repostory.upsert(saleInventory);

                    changeNotifier.notify(["inventories", "sales"])
            }


        }
    }
}
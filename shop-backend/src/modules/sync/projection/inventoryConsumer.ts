import { EventConsumer } from "@business/event-bus";
import {  DomainEvent, InventoryEventType, salesEventType } from "@business/shared-types";
import {  InventoryReducer } from "@business/projection-families";
import { InventoryRepository } from "../repositories/InventoryRepository.js";

export class InventoryConsumer
implements EventConsumer<DomainEvent> {

    readonly name = "inventories"
    constructor(
        private readonly repostory: InventoryRepository

    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case InventoryEventType.INVENTORY_ADDED:
                    const inventory = new InventoryReducer().reduce(null, event)
                    await this.repostory.upsert(inventory)
                    break

                case InventoryEventType.INVENTORY_RECEIVED: 
                    const currentReceivedInventory = await this.repostory.findByProductId(event.businessId!, event.branchId!, event.payload.productId);
                    const receivedInventory = new InventoryReducer().reduce(currentReceivedInventory, event);
                    console.log("This is the reduced Received Inventory: ", receivedInventory)
                    await this.repostory.upsert(receivedInventory);

                    changeNotifier.notify(["inventories"])

                    break

                case InventoryEventType.INVENTORY_ADJUSTED: 
                    const currentAdjustedInventory = await this.repostory.findProductId(event.payload.productId);

                    const adjustedInventory = new InventoryReducer().reduce(currentAdjustedInventory, event);

                    await this.repostory.upsert(adjustedInventory);

                    changeNotifier.notify(["inventories"])

                    break
                
                case InventoryEventType.INVENTORY_TRANSFER: 
                    const currentTransferInventory = await this.repostory.findProductId(event.payload.productId);

                    const transferInventory = new InventoryReducer().reduce(currentTransferInventory, event);

                    await this.repostory.upsert(transferInventory);

                    changeNotifier.notify(["inventories"])

                    break
                case salesEventType.SALE_ADDED:
                    const currentInventory = await this.repostory.findProductId(event.payload.productId);

                    const saleInventory = new InventoryReducer().reduce(currentInventory, event);

                    await this.repostory.upsert(saleInventory);

                    changeNotifier.notify(["inventories", "sales"])
            }
            break

        }
    }
}
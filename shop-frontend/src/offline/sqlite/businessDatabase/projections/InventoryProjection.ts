import { EventConsumer } from "@business/event-bus";
import {  DomainEvent, InventoryEventType } from "@business/shared-types";
import {  InventoryReducer } from "@business/projection-families";
import { SQLiteInventoryRepository } from "../repositories/SQLiteProjectionRepository/SQLiteInventoryRepository";

export class InventoryConsumer
implements EventConsumer<DomainEvent> {
    constructor(
        private readonly repostory: SQLiteInventoryRepository

    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case InventoryEventType.INVENTORY_ADDED:
                    const inventory = new InventoryReducer().reduce(null, event)
                    await this.repostory.upsert(inventory)
                    break
            }

        }
    }
}
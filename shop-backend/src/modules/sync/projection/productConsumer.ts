import { EventConsumer } from "@business/event-bus";
import { InventoryEventType, DomainEvent } from "@business/shared-types";
import { ProductReducer } from "@business/projection-families";
import { ProductRepository } from "../repositories/ProductRepository.js";
export class ProductConsumer
implements EventConsumer<DomainEvent> {
    
    readonly name = "products"
    constructor(
        private readonly repostory: ProductRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case InventoryEventType.PRODUCT_CREATED:
                    const product = new ProductReducer().reduce(null, event)
                    await this.repostory.upsert(product)
                    
                    break
            }

        }
    }
}
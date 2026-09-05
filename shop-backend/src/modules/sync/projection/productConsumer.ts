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
                    console.log(
                        "Product received by backend:",
                        product
                    )
                    await this.repostory.upsert(product)

                    console.log(
                        "Product created:",
                        product
                    )
                    break
                case InventoryEventType.PRODUCT_UPDATED:
                    const updatedProduct = await this.repostory.findById(event.payload.id, event.payload.businessId)
                    if(!updatedProduct){
                        console.error("Product not found for update:", event.payload.id)
                        break
                    }
                    const updatedproduct = new ProductReducer().reduce(updatedProduct as any, event)
                    await this.repostory.upsert(updatedproduct)
                    console.log(
                        "Product updated:",
                        updatedproduct
                    )
                    break
            }

        }
    }
}
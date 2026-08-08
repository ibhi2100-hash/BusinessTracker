import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { CreateBusinessRequest } from "../types";
import { ProductPayload, ProductRequest } from "./ProductRequest";
import { InventoryEventType } from "@business/shared-types";


export class ProductApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async create(
        request: ProductRequest
    ){
        
       const productIntent: CommandIntent<ProductPayload> = {
            type: InventoryEventType.PRODUCT_CREATED,
            aggregateId: request.id,
            aggregateType: AggregateType.PRODUCT,
            mode: request.mode,
            payload: {
                id: request.id,
                name: request.name,
                price: request.price,
                costPrice: request.costPrice,
                imageUrl: request.imageUrl,
                description: request.description
            }
       }

       const app = await this.manager.current()
       console.log("This is the Current Business Runtime: ", app)
       const command = await app.domain.commandFactory.create(productIntent);

       await app.domain.kernel.execute(command)
    }

    async update(businessId: string, request: ProductRequest) {
        // Implementation for creating a branch
    }

    async delete(productId){

    }
}
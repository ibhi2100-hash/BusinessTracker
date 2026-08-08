import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business, BusinessEventTypes, InventoryEventType } from "@business/shared-types";
import { CreateBusinessRequest } from "../types";
import { InventoryPayload, InventoryRequest } from "./InventoryRequest";


export class InventoryApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async createStock(request: InventoryRequest){
        
        const inventoryIntent: CommandIntent<InventoryPayload> = {
            type: InventoryEventType.INVENTORY_ADDED,
            aggregateId: request.id,
            aggregateType: AggregateType.INVENTORY,
            mode: request.mode,
            payload: {
                id: request.id,
                productId: request.productId,
                costPrice: request.costPrice,
                quantity: request.quantity
            }
        }
        const app = await this.manager.current();

        const command = await app.domain.commandFactory.create(inventoryIntent);
        
        await app.domain.kernel.execute(command)
    }
    async receiveStock(){

    }

    async adjust(){

    }
    async transfer(){
        
    }
}
import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { InventoryEventType } from "@business/shared-types";

import { AdjustInventoryPayload, AdjustInventoryRequest, InventoryPayload, InventoryRequest, ReceivedInventoryPayload, ReceiveInventoryRequest, TransferInventoryPayload, TransferInventoryRequest } from "./InventoryRequest";


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
    async receiveStock(request: ReceiveInventoryRequest){

         const receivedInventoryIntent: CommandIntent<ReceivedInventoryPayload> = {
            type: InventoryEventType.INVENTORY_RECEIVED,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.INVENTORY,
            mode: request.mode,
            payload: request.payload
        }
        const app = await this.manager.current();

        const recieveCommand = await app.domain.commandFactory.create(receivedInventoryIntent);
        console.log("This is the Received Stock Command", recieveCommand)
        await app.domain.kernel.execute(recieveCommand)
    }

    async adjust(request: AdjustInventoryRequest){
         const adjustIntent: CommandIntent<AdjustInventoryPayload> = {
            type: InventoryEventType.INVENTORY_ADJUSTED,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.INVENTORY,
            mode: request.mode,
            payload: request.payload
        }
        const app = await this.manager.current();

        const adjustCommand = await app.domain.commandFactory.create(adjustIntent);
        
        await app.domain.kernel.execute(adjustCommand)
    }
    async transfer(request: TransferInventoryRequest){
         const transferIntent: CommandIntent<TransferInventoryPayload> = {
            type: InventoryEventType.INVENTORY_TRANSFER,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.INVENTORY,
            mode: request.mode,
            payload: request.payload
        }
        const app = await this.manager.current();

        const transferCommand = await app.domain.commandFactory.create(transferIntent);
        
        await app.domain.kernel.execute(transferCommand)
    }
}
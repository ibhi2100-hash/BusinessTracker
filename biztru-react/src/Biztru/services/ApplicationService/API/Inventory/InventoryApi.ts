import { AggregateType } from "../../../../../offline/domain/aggregate";
import type{ CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent"; 
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import { InventoryEventType } from "@business/shared-types";

import type{ AdjustInventoryPayload, AdjustInventoryRequest, InventoryPayload, InventoryRequest, ReceivedInventoryPayload, ReceiveInventoryRequest, TransferInventoryPayload, TransferInventoryRequest } from "./InventoryRequest";


export class InventoryApi {
    private readonly manager: BusinessManager;
    constructor(
        manager: BusinessManager
    ) {
        this.manager = manager;
    }
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

        const command = await app?.domain.commandFactory.create(inventoryIntent);
         if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
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

        const recieveCommand = await app?.domain.commandFactory.create(receivedInventoryIntent);
         if(!app){
            throw new Error("Business Does not exist")
        }
        if(!recieveCommand){
            throw new Error("Business Does not exist")
        }
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

        const adjustCommand = await app?.domain.commandFactory.create(adjustIntent);

         if(!app){
            throw new Error("Business Does not exist")
        }
        if(!adjustCommand){
            throw new Error("Business Does not exist")
        }
        
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

        const transferCommand = await app?.domain.commandFactory.create(transferIntent);
         if(!app){
            throw new Error("Business Does not exist")
        }
        if(!transferCommand){
            throw new Error("Business Does not exist")
        }
        await app.domain.kernel.execute(transferCommand)
    }
}
import { AggregateType } from "../../../../../offline/domain/aggregate" 
import type{ CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent" 
import { BusinessManager } from "../../../../Composer/BusinessManager"


interface capitalPayload {
    amount: number
}

export class CapitalApi {
    private readonly manager: BusinessManager;
    constructor(
        manager: BusinessManager
    ) {
        this.manager = manager;
    }
    async injectCapital(
        request: any
    ){
        

        const intent: CommandIntent<capitalPayload> ={ 
            aggregateId: request.aggregateId,
            aggregateType: request.aggregateType,
            type: request.type,
            mode: request.mode,
            payload: {
                amount: request.payload.amount
            }
        }

        const app = await this.manager.current()

        const command = await app?.domain.commandFactory.create(intent);
        if(!app){
            throw new Error("application of business does not exist")
        }
        if(!command){
            throw new Error("No command is created")
        }
        await app.domain.kernel.execute(command)  

    }

    async withdrawCapital(request: any) {
        const branchIntent: CommandIntent<capitalPayload> = {
            type: request.type,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.CAPITAL_ACCOUNT,
            payload: {
                amount: request.payload.amount
            },
            mode: request.mode
        }
        const app = await this.manager.current();

        const command = await app?.domain.commandFactory.create(branchIntent);
        if(!app){
            throw new Error("application of business does not exist")
        }
        if(!command){
            throw new Error("No command is created")
        }
        await app.domain.kernel.execute(command)
    }
}
import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";


interface capitalPayload {
    amount: number
}

export class CapitalApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async injectCapital(
        request
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

        const command = await app.domain.commandFactory.create(intent);

        await app.domain.kernel.execute(command)  

    }

    async withdrawCapital(request) {
        const branchIntent: CommandIntent<capitalPayload> = {
            type: request.type,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.BRANCH,
            payload: {
                amount: request.payload.amount
            },
            mode: request.mode
        }
        const app = await this.manager.current();

        const command = await app.domain.commandFactory.create(branchIntent);

        await app.domain.kernel.execute(command)
    }
}
import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { BranchPayload } from "./branchRequest";



export class BranchApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async switchBranch(
        request
    ){
        

        const intent: CommandIntent<BranchPayload> ={ 
            aggregateId: request.aggregateId,
            aggregateType: request.aggregateType,
            type: request.type,
            mode: request.mode,
            payload: {
                id: request.payload.id,
                name: request.name,
                address: request.address,
                phone: request.phone
            }
        }

        const app = await this.manager.current()

        const command = await app.domain.commandFactory.create(intent);

        await app.domain.kernel.execute(command)  

    }

    async createBranch(request) {
        const branchIntent: CommandIntent<BranchPayload> = {
            type: request.type,
            aggregateId: request.aggregateId,
            aggregateType: AggregateType.BRANCH,
            payload: {
                id: request.id,
                name: request.name,
                address: request.address,
                phone: request.phone
            },
            mode: request.mode
        }
        const app = await this.manager.current();

        const command = await app.domain.commandFactory.create(branchIntent);

        await app.domain.kernel.execute(command)
    }
}
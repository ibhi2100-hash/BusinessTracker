import { AggregateType } from "../../../../../offline/domain/aggregate";
import type{ CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent"; 
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import type{ BranchPayload } from "./branchRequest";



export class BranchApi {
    private readonly manager: BusinessManager;
    constructor(
        manager: BusinessManager
    ) {
        this.manager = manager;
    }
    async switchBranch(
        request: any
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

        const command = await app?.domain.commandFactory.create(intent);
        if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
        await app.domain.kernel.execute(command)  

    }

    async createBranch(request: any) {
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

        const command = await app?.domain.commandFactory.create(branchIntent);
         if(!app){
            throw new Error("Business Does not exist")
        }
        if(!command){
            throw new Error("Business Does not exist")
        }
        await app.domain.kernel.execute(command)
    }
}
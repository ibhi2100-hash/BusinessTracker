import { AggregateType } from "../../../../../offline/domain/aggregate"; 
import type{ CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent"; 
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import {  BusinessEventTypes } from "@business/shared-types";
import type{ CreateBusinessRequest } from "../types";
import type{ BranchCreationRequest, BranchPayload } from "../branch/branchRequest";


export class OnboardingApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async createBusiness(
        request: CreateBusinessRequest
    ){
        

        const intent: CommandIntent<any> ={ 
            aggregateId: request.id,
            aggregateType: AggregateType.BUSINESS,
            type: BusinessEventTypes.BUSINESS_CREATED,
            mode:"OPENING",
            payload: {
                id: request.id,
                name: request.name,
                address: request.address
            }
        }
        
        const app = await this.manager.bootstrap(request.id);

        const command = await app.domain.commandFactory.create(intent);

        await app.domain.kernel.execute(command)  

    }

    async createMainBranch(request: BranchCreationRequest) {
        const branchIntent: CommandIntent<BranchPayload> = {
            type: BusinessEventTypes.BRANCH_CREATED,
            aggregateId: request.id,
            aggregateType: AggregateType.BRANCH,
            payload: {
                id: request.id,
                name: request.name,
                address: request.address ??  null,
                phone: request.phone ?? null
            },
            mode: "OPENING"   
        }
        const app = await this.manager.current();

        const command = await app.domain.commandFactory.create(branchIntent);

        await app.domain.kernel.execute(command)
    }

    async activateBusiness(businessId: string){
        const intent: CommandIntent<any> ={ 
            aggregateId: businessId,
            aggregateType: AggregateType.BUSINESS,
            type: BusinessEventTypes.BUSINESS_ACTIVATION,
            mode:"OPENING",
            payload: {}
        }
        
        const app = await this.manager.current();

        const command = await app.domain.commandFactory.create(intent);

        await app.domain.kernel.execute(command)  

    }

}
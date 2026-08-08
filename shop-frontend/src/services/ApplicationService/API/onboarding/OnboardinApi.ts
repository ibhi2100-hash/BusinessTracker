import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business, BusinessEventTypes } from "@business/shared-types";
import { CreateBusinessRequest } from "../types";
import { BranchCreationRequest, BranchPayload } from "../branch/branchRequest";


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
        console.log("this the business request: ", request)
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
}
import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business, BusinessEventTypes } from "@business/shared-types";
import { CreateBusinessRequest } from "./types";
import { convertSegmentPathToStaticExportFilename } from "next/dist/shared/lib/segment-cache/segment-value-encoding";

export class OnboardingApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async createBusiness(
        request: CreateBusinessRequest
    ){
        const businessId = crypto.randomUUID();
        const aggregateId = crypto.randomUUID();

        const intent: CommandIntent<any> ={ 
            aggregateId: aggregateId,
            aggregateType: AggregateType.BUSINESS,
            type: BusinessEventTypes.BUSINESS_CREATED,
            mode:"OPENING",
            payload: {
                id: businessId,
                name: request.name,
                address: request.address
            }
        }
        console.log("this the business request: ", request)
        const app = await this.manager.bootstrap(businessId);

        const command = await app.domain.commandFactory.create(intent);

        await app.domain.kernel.execute(command)  

    }

    async createBranch(businessId: string, request: CreateBranchRequest) {
        // Implementation for creating a branch
    }
}
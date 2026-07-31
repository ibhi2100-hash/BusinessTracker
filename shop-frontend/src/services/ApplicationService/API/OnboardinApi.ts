import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business, BusinessEventTypes } from "@business/shared-types";
import { CreateBusinessRequest } from "./types";

export class OnboardingApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async createBusiness(
        request: CreateBusinessRequest
    ){
        const businessId = crypto.randomUUID();
        const aggregateId = crypto.randomUUID();


        const business: Business = {
            id: businessId,
            type: BusinessEventTypes.BUSINESS_CREATED,
            payload: request
        }

    }
}
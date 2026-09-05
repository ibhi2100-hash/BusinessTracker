import { EventConsumer } from "@business/event-bus";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { BusinessRepository } from "../repositories/BusinessRepository.js";
import { BusinessReducer } from "@business/projection-families";
export class BusinessConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "businesses"
    constructor(
        private readonly repostory: BusinessRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BUSINESS_CREATED:
                    const business = new BusinessReducer().reduce(null, event)
                    await this.repostory.upsert(business)
                    break
                case BusinessEventTypes.BUSINESS_ACTIVATION:
                    const businessState = await this.repostory.findById(event.businessId!);
                    const businessActivation = new BusinessReducer().reduce(businessState, event);
                    await this.repostory.activateBusiness(businessActivation)
                    break
            }

        }
    }
}
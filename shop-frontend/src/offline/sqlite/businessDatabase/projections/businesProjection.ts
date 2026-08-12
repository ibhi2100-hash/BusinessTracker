import { EventConsumer } from "@business/event-bus";
import { Business, BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { SQLiteBusinessRepository } from "../repositories/SQLiteProjectionRepository/SQLiteBusinessRepository";
import { BusinessReducer } from "@business/projection-families";
import { changeNotifier } from "./changeNoifier";

export class BusinessConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "businesses"
    constructor(
        private readonly repostory: SQLiteBusinessRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BUSINESS_CREATED:
                    const business = new BusinessReducer().reduce(null, event)
                    await this.repostory.upsert(business)
                    changeNotifier.notify(["businesses"])
                    break
                case BusinessEventTypes.BUSINESS_ACTIVATION:
                    const businessState = await this.repostory.findById(event.businessId);
                    const businessActivation = new BusinessReducer().reduce(businessState, event);
                    changeNotifier.notify(["businesses"])
                    break
            }

        }
    }
}
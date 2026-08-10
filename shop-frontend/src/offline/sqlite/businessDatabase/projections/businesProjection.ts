import { EventConsumer } from "@business/event-bus";
import { Business, BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { SQLiteBusinessRepository } from "../repositories/SQLiteProjectionRepository/SQLiteBusinessRepository";
import { BusinessReducer } from "@business/projection-families";

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
                    break
            }

        }
    }
}
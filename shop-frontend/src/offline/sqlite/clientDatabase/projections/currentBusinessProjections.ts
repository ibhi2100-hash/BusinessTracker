import { EventConsumer } from "@business/event-bus";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { CurrentBusiness, CurrentBusinessRepository } from "../repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";

export class CurrentBusinessProjection
implements EventConsumer<DomainEvent> {
    constructor(
        private readonly repository: CurrentBusinessRepository
    ){}

    name: string = "CurrentBusiness"
    async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BUSINESS_CREATED:
                    const businessData: CurrentBusiness = {
                        id: 1,
                        businessId: event.aggregateId,
                        businessName: event.payload.name,
                        businessCode: event.aggregateId,
                        initializedAt: Date.now()
                    }

                    await this.repository.save(businessData)
                    break;
                
                case BusinessEventTypes.BUSINESS_ACTIVATION:
                    const business: CurrentBusiness = {
                        id: 1,
                        businessId: event.businessId,
                        businessCode: event.businessId,
                        activatedAt: Date.now(),
                        stage: "ACTIVE",
                        initializedAt: Date.now(),
                        updatedAt: Date.now()
                    }

                    await this.repository.save(business);
                    break
            }
        }
    }
}
import { EventConsumer } from "@business/event-bus";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { SQLiteApplicationStateRepository } from "../repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";

export class ApplicationStateProjection
implements EventConsumer<DomainEvent> {
    constructor(
        private readonly repository: SQLiteApplicationStateRepository
    ){}

    async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            switch(event.type){

                case BusinessEventTypes.BUSINESS_CREATED:
                    

                    await this.repository.setCurrentBusiness(event.aggregateId);
                    break;
                
                case BusinessEventTypes.BRANCH_CREATED:
                    await this.repository.setCurrentBranch(event.aggregateId)
                    break
            }
        }
    }
}
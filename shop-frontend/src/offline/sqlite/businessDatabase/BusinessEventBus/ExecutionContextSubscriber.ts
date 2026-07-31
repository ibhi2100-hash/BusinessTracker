import { EventSubscriber, ExecutionContextBus, InMemoryEventBus } from "@business/event-bus";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { ExecutionContextRepository } from "../../clientDatabase/repositories/ExecutionContextRepitory/ExecutionContextRepository";
import { ExecutionContextProvider } from "../../../../BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";

export class FrontendExecutionContextBus<TEvent>
extends InMemoryEventBus<TEvent>
implements ExecutionContextBus<TEvent>{
    constructor(
        private readonly repository: ExecutionContextRepository,
        private readonly context: ExecutionContextProvider
    ){
        super()
    }

    async handle(events: DomainEvent<unknown>[]): Promise<void> {
        let changed = false;
        for(const event of events){
            switch(event.type){
                case BusinessEventTypes.BRANCH_CREATED:
                    await this.repository.addKnownBusiness(
                        event.aggregateId
                    )
                    changed = true;
                    break

                case BusinessEventTypes.BRANCH_CREATED:
                    await this.repository.setActiveBranch(
                        event.aggregateId
                    )
                    changed = true;
                    break;

            }

            if(changed){
                await this.context.refresh()
            }
        }
    }
}
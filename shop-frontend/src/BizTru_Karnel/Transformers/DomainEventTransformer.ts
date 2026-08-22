import { Command } from "../KarnelTypes/types";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { BusinessContext } from "../../Composer/context/BusinessContextContract"

export async function domainEventTransformer(command: Command,  context: BusinessContext, logicClock: number, expectedAggregateVersion: number):Promise<DomainEvent>{
    return {
        id: command.id,
        aggregateId: command.aggregateId,
        aggregateType: command.aggregateType,
        expectedAggregateVersion,
        type: command.type,
        mode: command.mode,
        businessId: 
            command.type === BusinessEventTypes.BUSINESS_CREATED
                ? command.aggregateId
                :context.businessId,
        branchId:
            command.type === BusinessEventTypes.BRANCH_CREATED 
                ?command.aggregateId
                :context.branchId,
        payload: command.payload,
        actor: command.actor,
        causationId: command.causationId,
        logicClock,
        createdAt: command.createdAt,
    }

}
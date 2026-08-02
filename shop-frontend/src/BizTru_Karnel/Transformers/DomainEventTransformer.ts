import { Command } from "../KarnelTypes/types";
import { DomainEvent } from "@business/shared-types";
import { BusinessContext } from "../../Composer/context/BusinessContextContract"
import { getExpectedAggregateVersion } from "../VersionManager/ExpectedAggregationVersion";

export async function domainEventTransformer(command: Command, metadata: any, context: BusinessContext):Promise<DomainEvent>{
const expectedAggregateVersion = await getExpectedAggregateVersion(command.aggregateId)
    return {
        id: command.id,
        aggregateId: command.aggregateId,
        aggregateType: command.aggregateType,
        expectedAggregateVersion,
        type: command.type,
        mode: command.mode,
        businessId: context.businessId,
        branchId: context.branchId,
        payload: command.payload,
        actor: command.actor,
        metadata,

    }

}
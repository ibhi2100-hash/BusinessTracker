import { Command } from "../KarnelTypes/types";
import { DomainEvent } from "@business/shared-types";
import { getExpectedAggregateVersion } from "../VersionManager/ExpectedAggregationVersion";
export async function domainEventTransformer(command: Command):Promise<DomainEvent>{
    console.log("Command hit the Transfomer now: ", command)
    const expectedAggregateVersion = await getExpectedAggregateVersion(command.aggregateId)
    console.log("ExpectedAggregateVersion is Return Transformation is about to start now ")
    return {
        id: command.id,
        aggregateId: command.aggregateId,
        aggregateType: command.aggregateType,
        expectedAggregateVersion,
        type: command.type,
        mode: command.mode,
        payload: command.payload,
        actor: command.actor,
        metadata: command.metadata,

    }

}
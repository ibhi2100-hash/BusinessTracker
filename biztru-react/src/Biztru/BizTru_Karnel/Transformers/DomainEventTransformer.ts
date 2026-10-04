import type { Command } from "../KarnelTypes/types";
import type { DomainEvent } from "@business/shared-types";
import { BusinessEventTypes } from "@business/shared-types";
import type { BusinessContext } from "../../Composer/context/BusinessContextContract";

export async function domainEventTransformer(
    command: Command,
    context: BusinessContext,
    logicClock: number,
    expectedAggregateVersion: number
): Promise<DomainEvent> {

    const businessId =
        command.type === BusinessEventTypes.BUSINESS_CREATED
            ? command.aggregateId
            : context.businessId;

    if (!businessId) {
        throw new Error(
            "BusinessId is required to transform this command into a domain event"
        );
    }

    return {
        id: command.id,
        aggregateId: command.aggregateId,
        aggregateType: command.aggregateType,
        expectedAggregateVersion,
        type: command.type,
        mode: command.mode,

        businessId,

        branchId:
            command.type === BusinessEventTypes.BRANCH_CREATED
                ? command.aggregateId
                : context.branchId ?? null,

        payload: command.payload,
        actor: command.actor,
        causationId: command.causationId,
        correlationId: command.correlationId,
        logicClock,
        createdAt: command.createdAt,
        checksum: crypto.randomUUID(),
    };
}
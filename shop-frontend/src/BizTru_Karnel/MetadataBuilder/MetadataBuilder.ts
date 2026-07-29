import { getNextLogicClock } from "@/src/utils/getNextLogicClock";
import { ExecutionContext } from "../KarnelTypes/types";
import { MetadataBuilderContract } from "./MetadataBuilderContract";
import { EventMetadata } from "@business/shared-types";


export class MetadataBuilder implements MetadataBuilderContract {
    
    async build(context: ExecutionContext): Promise<EventMetadata> {
        const correlationId = crypto.randomUUID();
        const causationId  = crypto.randomUUID();
        const logicalClock =await getNextLogicClock()
        const now = Date.now();
        return {
            occuredAt: now,
            correlationId,
            causationId,
            logicalClock
        }

    }
}
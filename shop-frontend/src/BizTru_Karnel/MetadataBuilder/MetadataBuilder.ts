import { ExecutionContext } from "../KarnelTypes/types";
import { MetadataBuilderContract } from "./MetadataBuilderContract";
import { CommandMetadata } from "./CommandMetadata";


export class MetadataBuilder implements MetadataBuilderContract {
    
    async build(): Promise<CommandMetadata> {
        const correlationId = crypto.randomUUID();
        const causationId  = crypto.randomUUID();
        const now = Date.now();
        return {
            occuredAt: now,
            correlationId,
            causationId,

    }
    }
}
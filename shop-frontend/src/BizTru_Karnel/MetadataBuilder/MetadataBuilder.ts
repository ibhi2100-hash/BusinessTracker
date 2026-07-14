import { getNextLogicClock } from "@/src/utils/getNextLogicClock";
import { ApplicationContext } from "../CommandFactory/ExecutionContext/ExecutionContextContract";
import { CommandMetadata, MetadataBuilderContract } from "./MetadataBuilderContract";


export class MetadataBuilder implements MetadataBuilderContract {

    async build(context: ApplicationContext): Promise<CommandMetadata> {
        const correlationId = crypto.randomUUID();
        const causationId  = crypto.randomUUID();
        const logicalClock =await getNextLogicClock()

        return {
            correlationId,
            causationId,
            logicalClock
        }

    }
}
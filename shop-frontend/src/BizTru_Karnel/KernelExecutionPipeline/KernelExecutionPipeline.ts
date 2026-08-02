import { CommandValidator, EventAppender, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import { BusinessClock } from "../logicClockContract";
import { EventMetadataBuilder } from "../MetadataBuilder/EventMetadataBuilder";
import { BusinessContextProvider } from "../../Composer/context/BusinessContextContract"

export class KernelExecutionPipeline
implements PipelineKernel {
    
    constructor(
        private readonly validator: CommandValidator,
        private readonly eventStore: EventAppender,
        private readonly clock: BusinessClock,
        private readonly metadataBuilder: EventMetadataBuilder,
        private readonly businessContext: BusinessContextProvider
    ) {
        console.log("this is the Business Context: ", businessContext)
    }

    async execute(command: Command): Promise<void> {

        // 1. Validate command
        await this.validator.validate(command);

        // 2. Reserve the next business-local logical clock
        const logicalClock = await this.clock.next();

        // 3. Build immutable event metadata
        const metadata = this.metadataBuilder.build(
            command.metadata,
            logicalClock
        );

        const context = 
            await this.businessContext.current();

        // 4. Convert command -> event
        const event =await domainEventTransformer(
            command,
            metadata,
            context
        );

        console.log("this is the event to be appended: ", event)

        // 5. Persist atomically
        await this.eventStore.append([event]);
    }
}
import { CommandValidator, EventAppender, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import { BusinessClock } from "../logicClockContract";
import { EventMetadataBuilder } from "../MetadataBuilder/EventMetadataBuilder";

export class KernelExecutionPipeline
implements PipelineKernel {
    
    constructor(
        private readonly validator: CommandValidator,
        private readonly eventStore: EventAppender,
        private readonly clock: BusinessClock,
        private readonly metadataBuilder: EventMetadataBuilder,
    ) {}

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

        // 4. Convert command -> event
        const event =await domainEventTransformer(
            command,
            metadata
        );

        console.log("this is the event to be appended: ", event)

        // 5. Persist atomically
        await this.eventStore.append([event]);
    }
}
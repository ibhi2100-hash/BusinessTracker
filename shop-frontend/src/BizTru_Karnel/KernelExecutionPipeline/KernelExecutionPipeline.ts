import { CommandValidator, PipelineKernel } from "../contracts/SubKernelContracts";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";
import { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import { BusinessClock } from "../logicClockContract";
import { BusinessContextProvider } from "../../Composer/context/BusinessContextContract"
import { EventStore } from "../SubKernel/types";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { FrontendBusinessContext } from "@/src/Composer/context/BusinessContext";

export class KernelExecutionPipeline
implements PipelineKernel {
    
    constructor(
        private readonly validator: CommandValidator,
        private readonly eventStore: EventStore,
        private readonly clock: BusinessClock,
        public businessContext: FrontendBusinessContext,
        private readonly clientBus: ProjectionEventBus,
        private readonly businessBus: ProjectionEventBus,
        private readonly transaction: TransactionManager

    ) {}

    async execute(command: Command): Promise<void> {

        // 1. Validate command
        await this.validator.validate(command);

        // 2. Reserve the next business-local logical clock
        const logicalClock = await this.clock.next();

        const context = 
            await this.businessContext.current();

        // 4. Convert command -> event
        const event =await domainEventTransformer(
            command,
            context,
            logicalClock
        );

        console.log("this is the event to be appended: ", event)

        await this.transaction.run(async () => {
            await this.eventStore.append([event]);
            await this.clientBus.publish(event),
            await this.businessBus.publish(event)
        })
        
    }
}
import { EventBus, ExecutionContextBus } from "@business/event-bus";
import { CommandValidator, EventAppender, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { DomainEvent } from "@business/shared-types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer"
import { BusinessProvisioner } from "../SubKernel/types";
import { FrontendProjectionBus } from "@/src/offline/sqlite/businessDatabase/BusinessEventBus/ProjectionBus";
import { FrontEndEventBus } from "@/src/offline/sqlite/businessDatabase/BusinessEventBus/EventBus";
import { FrontendLedgerBus } from "@/src/offline/sqlite/businessDatabase/BusinessEventBus/LedgerBus";
import { FrontendAnalyticBus } from "@/src/offline/sqlite/businessDatabase/BusinessEventBus/AnalyticBus";

export class KernelExecutionPipeline
implements PipelineKernel {
    
    
    constructor(
        
        private readonly validator: CommandValidator,
        private readonly eventStore: EventAppender,
    ){}
  
    async execute(command: Command): Promise<void> {
        await this.validator.validate(command);
        const event = await domainEventTransformer(command);
        await this.eventStore.append([event])

    }
}
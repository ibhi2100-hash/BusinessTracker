import { EventBus, ExecutionContextBus } from "@business/event-bus";
import { CommandValidator, EventAppender, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { DomainEvent } from "@business/shared-types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer"
import { BusinessProvisioner } from "../SubKernel/types";
import { FrontendProjectionBus } from "@/src/eventBus/ProjectionBus";
import { FrontEndEventBus } from "@/src/eventBus/EventBus";
import { FrontendLedgerBus } from "@/src/eventBus/LedgerBus";
import { FrontendAnalyticBus } from "@/src/eventBus/AnalyticBus";

export class KernelExecutionPipeline
implements PipelineKernel {
    
    
    constructor(
        
        private readonly validator: CommandValidator,
        private readonly eventStore: EventAppender,
        private readonly constextBus: ExecutionContextBus<DomainEvent>,
        private readonly projecitionBus: FrontendProjectionBus<DomainEvent>,
        private readonly ledgerBus: FrontendLedgerBus<DomainEvent>,
        private readonly eventBus: FrontEndEventBus<DomainEvent>,
        private readonly analyticBus: FrontendAnalyticBus<DomainEvent>
    ){}
  
    async execute(command: Command): Promise<void> {
        await this.validator.validate(command);
        const event = await domainEventTransformer(command);
        await this.eventStore.append([event])

        await Promise.all([
            this.constextBus.publish(event),
            this.eventBus.publish(event),
            this.projecitionBus.publish(event),
            this.ledgerBus.publish(event),
            this.analyticBus.publish(event),
            
        ])

    }
}
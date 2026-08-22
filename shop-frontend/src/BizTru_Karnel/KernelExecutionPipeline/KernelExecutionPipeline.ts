import { CommandValidator, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import { BusinessClock } from "../logicClockContract";
import { EventStore } from "../SubKernel/types";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { FrontendBusinessContext } from "@/src/Composer/context/BusinessContext";
import { BusinessRepositoryRegistry } from "@/src/offline/sqlite/businessDatabase/repositories/RepositoryRegistry";

export class KernelExecutionPipeline
implements PipelineKernel {
    
    constructor(
        private readonly validator: CommandValidator,
        private readonly eventStore: EventStore,
        private readonly clock: BusinessClock,
        public businessContext: FrontendBusinessContext,
        private readonly clientBus: ProjectionEventBus,
        private readonly businessBus: ProjectionEventBus,
        private readonly transaction: TransactionManager,
        private readonly repository: BusinessRepositoryRegistry

    ) {}

    async execute(command: Command): Promise<void> {

    await this.validator.validate(command);

    const logicalClock =
        await this.clock.next();

    const context =
        await this.businessContext.current();

    const aggregateVersion =
        await this.repository.aggregates.getVersion(
            command.aggregateType,
            command.aggregateId
        );

    const expectedAggregateVersion =
        aggregateVersion.localVersion;

    const event =
        await domainEventTransformer(
            command,
            context,
            logicalClock,
            expectedAggregateVersion
        );

    await this.transaction.run(async () => {

        await this.eventStore.append([event]);

        await this.repository.aggregates.advanceLocal(
            event.aggregateType,
            event.aggregateId,
            event.expectedAggregateVersion,
            event.id,
            event.createdAt
        );

        await this.repository.outbox.insert({
            id: crypto.randomUUID(),
            eventId: event.id,
            createdAt: event.createdAt
        });
    });

    await this.clientBus.publish(event);
    await this.businessBus.publish(event);
}
}
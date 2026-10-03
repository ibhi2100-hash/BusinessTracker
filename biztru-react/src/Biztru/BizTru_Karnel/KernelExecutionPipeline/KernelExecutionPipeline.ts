import type { CommandValidator, PipelineKernel } from "../contracts/SubKernelContracts";
import type { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import type{ BusinessClock } from "../logicClockContract";
import { ProjectionEventBus } from "@business/event-bus";
import { TransactionManager } from "../../storage/transaction/TransactionManager"; 
import { FrontendBusinessContext } from "../../Composer/context/BusinessContext"; 
import { BusinessRepositoryRegistry } from "../../offline/sqlite/businessDatabase/repositories/RepositoryRegistry"; 
import { SQLiteEventRepository } from "../../offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore"; 
import type { SQLiteStatementOperation } from "@business/shared-types"; 

export class KernelExecutionPipeline
implements PipelineKernel {
    private readonly validator: CommandValidator;
    private readonly eventStore: SQLiteEventRepository;
    private readonly clock: BusinessClock
    public readonly businessContext: FrontendBusinessContext;
    private readonly clientBus: ProjectionEventBus
    private readonly businessBus: ProjectionEventBus
    private readonly transaction: TransactionManager
    private readonly repository: BusinessRepositoryRegistry
    constructor(
        validator: CommandValidator,
        eventStore: SQLiteEventRepository,
        clock: BusinessClock,
        businessContext: FrontendBusinessContext,
        clientBus: ProjectionEventBus,
        businessBus: ProjectionEventBus,
        transaction: TransactionManager,
        repository: BusinessRepositoryRegistry

    ) {
        this.validator = validator;
        this.eventStore = eventStore;
        this.clock = clock;
        this.businessContext = businessContext;
        this.clientBus = clientBus;
        this.businessBus = businessBus;
        this.transaction = transaction;
        this.repository = repository;
    }

    async execute(command: Command): Promise<void> {

    await this.validator.validate(command);

    const logicalClock = await this.clock.next();
    console.log("Logical clock value: ", logicalClock)
    const context = await this.businessContext.current();

    const aggregateVersion =
        await this.repository.aggregates.getVersion(
            command.aggregateId,
            command.aggregateType
        );

    const expectedAggregateVersion =
        aggregateVersion!.localVersion ?? 0;

    const event =
        await domainEventTransformer(
            command,
            context,
            logicalClock,
            expectedAggregateVersion
        );
    console.log("Tranformd event: ", event)
        
        const operations: SQLiteStatementOperation[] = [
            ...this.eventStore.appendOperations([event]),

            this.repository.aggregates
                .commitAggregateOperation(
                    event.aggregateType,
                    event.aggregateId,
                    event.expectedAggregateVersion,
                    event.id,
                    event.createdAt,
                    aggregateVersion!
                ),

            this.repository.outbox
                .insertOperation({
                    id: crypto.randomUUID(),
                    eventId: event.id,
                    createdAt: event.createdAt
                })
        ];

        await this.transaction.run(operations);
        await this.clientBus.publish(event);
        await this.businessBus.publish(event);

    }
}
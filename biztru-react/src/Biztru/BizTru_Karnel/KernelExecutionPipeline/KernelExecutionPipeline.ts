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
    
    constructor(
        private readonly validator: CommandValidator,
        private readonly eventStore: SQLiteEventRepository,
        private readonly clock: BusinessClock,
        public businessContext: FrontendBusinessContext,
        private readonly clientBus: ProjectionEventBus,
        private readonly businessBus: ProjectionEventBus,
        private readonly transaction: TransactionManager,
        private readonly repository: BusinessRepositoryRegistry

    ) {}

    async execute(command: Command): Promise<void> {

    console.log(
        "[KERNEL 01] ENTER",
        {
            commandId: command.id,
            type: command.type,
            aggregateId: command.aggregateId,
            aggregateType: command.aggregateType,
            mode: command.mode,
        }
    );

    console.log("[KERNEL 02] VALIDATING COMMAND");

    await this.validator.validate(command);

    console.log("[KERNEL 03] COMMAND VALIDATED");

    const logicalClock = await this.clock.next();
    const context = await this.businessContext.current();

    const aggregateVersion =
        await this.repository.aggregates.getVersion(
            command.aggregateId,
            command.aggregateType
        );

    const expectedAggregateVersion =
        aggregateVersion.localVersion ?? 0;

    const event =
        await domainEventTransformer(
            command,
            context,
            logicalClock,
            expectedAggregateVersion
        );
        
        const operations: SQLiteStatementOperation[] = [
            ...this.eventStore.appendOperations([event]),

            this.repository.aggregates
                .commitAggregateOperation(
                    event.aggregateType,
                    event.aggregateId,
                    event.expectedAggregateVersion,
                    event.id,
                    event.createdAt,
                    aggregateVersion
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
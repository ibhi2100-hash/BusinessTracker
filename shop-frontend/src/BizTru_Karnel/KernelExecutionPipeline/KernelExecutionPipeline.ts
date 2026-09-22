import { CommandValidator, PipelineKernel } from "../contracts/SubKernelContracts";
import { Command } from "../KarnelTypes/types";
import { domainEventTransformer } from "../Transformers/DomainEventTransformer";
import { BusinessClock } from "../logicClockContract";
import { EventStore } from "../EventStore/EventStore"
import { ProjectionEventBus } from "@business/event-bus";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { FrontendBusinessContext } from "@/src/Composer/context/BusinessContext";
import { BusinessRepositoryRegistry } from "@/src/offline/sqlite/businessDatabase/repositories/RepositoryRegistry";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";
import { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";

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

    console.log(
        "[KERNEL 04] LOGICAL CLOCK",
        logicalClock
    );

    const context = await this.businessContext.current();

    console.log(
        "[KERNEL 05] BUSINESS CONTEXT",
        context
    );

    const aggregateVersion =
        await this.repository.aggregates.getVersion(
            command.aggregateId,
            command.aggregateType
        );

    console.log(
        "[KERNEL 06] AGGREGATE VERSION",
        aggregateVersion
    );

    const expectedAggregateVersion =
        aggregateVersion.localVersion ?? 0;

    console.log(
        "[KERNEL 07] EXPECTED VERSION",
        expectedAggregateVersion
    );

    const event =
        await domainEventTransformer(
            command,
            context,
            logicalClock,
            expectedAggregateVersion
        );

    console.log(
        "[KERNEL 08] DOMAIN EVENT CREATED",
        event
    );

        console.log("[KERNEL 09] BEGIN TRANSACTION");
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
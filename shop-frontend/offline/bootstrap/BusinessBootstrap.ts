import { DefaultBusinessKernel } from "@/src/BizTru_Karnel/BusinessKernel";
import { CommandValidation } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/CommandValidator";
import { DefaultCommandFactory } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/DefaultCommandFactory";
import { IdGenerator } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/IdGenerators";
import { EventStored } from "@/src/BizTru_Karnel/EventStore/EventStore";
import { KernelExecutionPipeline } from "@/src/BizTru_Karnel/KernelExecutionPipeline/KernelExecutionPipeline";
import { BusinessApplication } from "@/src/Composer/BusinessApplicationComposer";
import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { BusinessBusesRegistry } from "@/src/offline/sqlite/businessDatabase/BusinessEventBus/BusinessBusesRegistry";
import { BusinessDomain } from "@/src/offline/sqlite/businessDatabase/domain/BusinessDomain";
import { BusinessMigrationRunner } from "@/src/offline/sqlite/businessDatabase/engine/MigrationManager";
import { BusinessRepositoryRegistry } from "@/src/offline/sqlite/businessDatabase/repositories/RepositoryRegistry";
import { BusinessServiceRegistry } from "@/src/offline/sqlite/businessDatabase/services/BusinessServiceRegistry";
import { BusinessStatementsDefinitions } from "@/src/offline/sqlite/businessDatabase/statements/BusinessStatementsDefinition";
import { BusinessPreparedStatementManager } from "@/src/offline/sqlite/businessDatabase/statements/PreparedStatementManager";
import { BusinessStatementRegistry } from "@/src/offline/sqlite/businessDatabase/statements/StatementRegistry";
import { BusinessStorage } from "@/src/offline/sqlite/businessDatabase/storage/BusinessStorage";
import { BusinessSynchronization } from "@/src/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";
import { Lifecycle } from "@/src/offline/sqlite/lifecycle/LifeCycle";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { BusinessRuntime } from "@/src/storage/runtime/BusinessRuntime";
import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { SQLiteBusinessClock } from "@/src/BizTru_Karnel/BusinessClock/SQLiteBusinessClock" 
import { FrontendBusinessContext } from "@/src/Composer/context/BusinessContext";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";
import { BusinessConsumer } from "@/src/offline/sqlite/businessDatabase/projections/businesProjection";
import { BranchConsumer } from "@/src/offline/sqlite/businessDatabase/projections/BranchProjection";
import { ProductConsumer } from "@/src/offline/sqlite/businessDatabase/projections/ProductProjection";
import { InventoryConsumer } from "@/src/offline/sqlite/businessDatabase/projections/InventoryProjection";
import { SalesConsumer } from "@/src/offline/sqlite/businessDatabase/projections/SalesProjection";
import { ProjectionRebuildObserver } from "@/src/offline/sqlite/businessDatabase/projections/rebuild/RebuildObserver";
import { ProjectionRebuilder } from "@/src/offline/sqlite/businessDatabase/projections/rebuild/ProjectionRebuilder";
import { ProjectionReset } from "@/src/offline/sqlite/businessDatabase/projections/rebuild/ProjectionResetter";
import { SQLiteProjectionResetRepository } from "@/src/offline/sqlite/businessDatabase/repositories/ProjectionResetRepository/ProjectionResetRepository";

export class BusinessBootstrapper
implements Lifecycle {

    async bootstrap(
        client: ApplicationContext,
        businessId: string
    ){
        const runtime = 
            await this.createRuntime(
                businessId
            )

        const storage = 
            await this.createStorage(
                runtime
            );
        const projectionBus = 
            await this.createProjectionBus();

        this.createConsumers(
            projectionBus,
            storage.repositories
        )

        const observer = new ProjectionRebuildObserver();

        const resetRepo = new SQLiteProjectionResetRepository(
            runtime.queryRunner
        )

        const resetter = new ProjectionReset(
            resetRepo
        )
        const rebuilder = new ProjectionRebuilder(
            runtime.transactionManager,
            storage.repositories.events,
            projectionBus,
            resetter,
            observer
        )
        const { context, domain } = 
            await this.createDomain(
                client,
                storage,
                projectionBus
            )
        
        
        const synchronization = 
            await this.createSynchronization(
                storage,
                domain
            )
        const application = 
            new BusinessApplication(
                businessId,
                context,
                runtime,
                storage,
                domain,
                synchronization,
                rebuilder,
            );
        await application.initialize();

        await application.start();
            
        return application
    }
    async initialize(): Promise<void> {
        
    }

    async start(): Promise<void> {
    
    }

    async stop(): Promise<void> {
        
    }

    async dispose(): Promise<void> {
        
    }

   private async createRuntime(businessId: string) : Promise<BusinessRuntime> {
        const sqlite = 
            new SQLiteRuntime({
                filename: 
                    `/business/${businessId}.db`
            });
        const queryRunner = new QueryRunner(sqlite);

        const transactionManager =  new TransactionManager(queryRunner);

        const runtime = new BusinessRuntime(
            businessId,
            sqlite,
            queryRunner,
            transactionManager
        )
        return runtime
    }

   private async createStorage(runtime: BusinessRuntime): Promise<BusinessStorage>{
        const migrationRunner = 
            new BusinessMigrationRunner(
                runtime.queryRunner,
                runtime.transactionManager
            )
        const statementManager = 
            new BusinessPreparedStatementManager(
                runtime.queryRunner
            );
       
      const statements = 
         new BusinessStatementRegistry(
            statementManager
         );
        const repositories = 
         new BusinessRepositoryRegistry(
            statements
         )

       return new BusinessStorage(
        runtime,
        migrationRunner,
        statements,
        statementManager,
        repositories
       )
   }

   private async createDomain(
        client: ApplicationContext,
        storage: BusinessStorage,
        bus: ProjectionEventBus
    ) {
    const executionContext =
        client.ExecutionContext
    const idGenerator = new IdGenerator()
   const eventbus = new EventStored(storage.repositories.events)
    const commandFactory =
        new DefaultCommandFactory(
            executionContext,
            idGenerator
        )
    const commandValidator =new CommandValidation();
    const clock = 
        new SQLiteBusinessClock(
            storage.repositories.logicClock
        )
    const context = new FrontendBusinessContext(
        client.repositories.applicationState
    )
    const pipeline = new KernelExecutionPipeline(
        commandValidator,
        eventbus,
        clock,
        context,
        client.clientBus,
        bus,
        storage.runtime.transactionManager
    )
    
    const kernel = new DefaultBusinessKernel(
        pipeline
    )
    
    const services = new BusinessServiceRegistry()
        
    const domain = new BusinessDomain(
        executionContext,
        commandFactory,
        kernel,
        eventbus,
        services,
        bus
    )
    return {
        context,
        domain
    }
   }

   private async createSynchronization(
        storage: BusinessStorage,
        domain: BusinessDomain
    ): Promise<BusinessSynchronization> {
        const buses = new BusinessBusesRegistry()
        return new BusinessSynchronization(buses)
   }

   private async createProjectionBus(){
    return new ProjectionEventBus()
   }

   private async createConsumers(
        bus: ProjectionEventBus,
        repositories: BusinessRepositoryRegistry
   ){
        bus.subscribe(
            new BusinessConsumer(
                repositories.business
            )
        );

        bus.subscribe(
            new BranchConsumer(
                repositories.branches
            )
        )

        bus.subscribe(
            new ProductConsumer(
                repositories.products
            )
        )

        bus.subscribe(
            new InventoryConsumer(
                repositories.inventory
            )
        )

        bus.subscribe(
            new SalesConsumer(
                repositories.sales
            )
        )
   }
}
import { DefaultBusinessKernel } from "../../Biztru/BizTru_Karnel/BusinessKernel"; 
import { CommandValidation } from "../../Biztru/BizTru_Karnel/CommandFactory/factoryDependencies/CommandValidator"; 
import { DefaultCommandFactory } from "../../Biztru/BizTru_Karnel/CommandFactory/factoryDependencies/DefaultCommandFactory"; 
import { IdGenerator } from "../../Biztru/BizTru_Karnel/CommandFactory/factoryDependencies/IdGenerators"; 
import { EventStore } from "../../Biztru/BizTru_Karnel/EventStore/EventStore"; 
import { KernelExecutionPipeline } from "../../Biztru/BizTru_Karnel/KernelExecutionPipeline/KernelExecutionPipeline"; 
import { BusinessApplication } from "../../Biztru/Composer/BusinessApplicationComposer"; 
import { ApplicationContext } from "../../Biztru/Composer/context/ApplicationContext"; 
import { BusinessDomain } from "../../Biztru/offline/sqlite/businessDatabase/domain/BusinessDomain"; 
import { BusinessMigrationRunner } from "../../Biztru/offline/sqlite/businessDatabase/engine/MigrationManager"; 
import { BusinessRepositoryRegistry } from "../../Biztru/offline/sqlite/businessDatabase/repositories/RepositoryRegistry"; 
import { BusinessPreparedStatementManager } from "../../Biztru/offline/sqlite/businessDatabase/statements/PreparedStatementManager"; 
import { BusinessStatementRegistry } from "../../Biztru/offline/sqlite/businessDatabase/statements/StatementRegistry"; 
import { BusinessStorage } from "../../Biztru/offline/sqlite/businessDatabase/storage/BusinessStorage"; 
import { BusinessSynchronization } from "../../Biztru/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization"; 
import type { Lifecycle } from "../../Biztru/offline/sqlite/lifecycle/LifeCycle"; 
import { QueryRunner } from "../../Biztru/storage/queryRunner/QueryRunner";
import { BusinessRuntime } from "../../Biztru/storage/runtime/BusinessRuntime"; 
import { TransactionManager } from "../../Biztru/storage/transaction/TransactionManager"; 
import { SQLiteBusinessClock } from "../../Biztru/BizTru_Karnel/BusinessClock/SQLiteBusinessClock"; 
import { FrontendBusinessContext } from "../../Biztru/Composer/context/BusinessContext"; 
import { ProjectionEventBus } from "@business/event-bus";
import { BusinessConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/businesProjection"; 
import { BranchConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/BranchProjection"; 
import { ProductConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/ProductProjection"; 
import { InventoryConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/InventoryProjection"; 
import { SalesConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/SalesProjection"; 
import { ProjectionRebuildObserver } from "../../Biztru/offline/sqlite/businessDatabase/projections/rebuild/RebuildObserver"; 
import { ProjectionRebuilder } from "../../Biztru/offline/sqlite/businessDatabase/projections/rebuild/ProjectionRebuilder"; 
import { ProjectionReset } from "../../Biztru/offline/sqlite/businessDatabase/projections/rebuild/ProjectionResetter"; 
import { SQLiteProjectionResetRepository } from "../../Biztru/offline/sqlite/businessDatabase/repositories/ProjectionResetRepository/ProjectionResetRepository"; 
import { LedgerConsumer } from "../../Biztru/offline/sqlite/businessDatabase/projections/LedgerProjection"; 
import { HttpSyncTransport } from "../../Biztru/offline/sqlite/businessDatabase/sync/SyncTransport"; 
import { SyncEngine } from "../../Biztru/offline/sqlite/businessDatabase/sync/syncEngine"; 
import { SyncCoordinator } from "../../Biztru/offline/sqlite/businessDatabase/sync/SyncCoordinator/SyncCoordinator"; 
import { NetworkSyncConnector } from "../../Biztru/offline/sqlite/businessDatabase/sync/NetworkSyncConnector"; 
import type{ DatabaseId } from "../../Biztru/storage/statement/worker/DatabaseId"; 


export class BusinessBootstrapper
implements Lifecycle {

    async bootstrap(
        client: ApplicationContext,
        businessId: string
    ){
        const runtime = 
            await this.createRuntime(
                client,
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
                storage
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

   private async createRuntime(
        client: ApplicationContext,
        businessId: string
    ): Promise<BusinessRuntime> {

        const sqlite =
            client.runtime;


        const database: DatabaseId = {
            type: "business",
            businessId,
        };


        await sqlite.openDatabase(
            database,
            `/business/${businessId}.db`
        );


        const queryRunner =
            new QueryRunner(
                sqlite,
                database
            );


        const transactionManager =
            new TransactionManager(
                queryRunner
            );


        return new BusinessRuntime(
            businessId,
            database,
            client.runtime,
            queryRunner,
            transactionManager
        );
    }
   private async createStorage(runtime: BusinessRuntime): Promise<BusinessStorage>{
        const migrationRunner = 
            new BusinessMigrationRunner(
                runtime.queryRunner
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
            statements,
            runtime.queryRunner,
            runtime.transactionManager
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
   const eventbus = new EventStore(storage.repositories.events)
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
        storage.repositories.events,
        clock,
        context,
        client.clientBus,
        bus,
        storage.runtime.transactionManager,
        storage.repositories
    )
    
    const kernel = new DefaultBusinessKernel(
        pipeline
    )

    const domain = new BusinessDomain(
        executionContext,
        commandFactory,
        kernel,
        eventbus,
    )
    return {
        context,
        domain
    }
   }

private async createSynchronization(
    storage: BusinessStorage,
): Promise<BusinessSynchronization> {

    const transport =
        new HttpSyncTransport(
            import.meta.env.VITE_API_URL
        );


    const engine =
        new SyncEngine(

            storage.repositories.outbox,

            transport,

            storage.repositories.syncState,

            storage.repositories.events,

            {
                pushBatchSize: 50,

                pullBatchSize: 100,

                lockDurationMs: 30_000,

                baseBackoffMs: 1_000,
            }
        );


    const coordinator =
        new SyncCoordinator(
            engine
        );


    const network =
        new NetworkSyncConnector(
            coordinator,
            {
                intervalMs:
                    30_000,

                syncOnStart:
                    false,
            }
        );


    return new BusinessSynchronization(

        coordinator,

        network
    );
}
   private async createProjectionBus(){
    return new ProjectionEventBus()
   }

   private createConsumers(
        bus: ProjectionEventBus,
        repositories: BusinessRepositoryRegistry
   ): void{
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

        bus.subscribe(
            new LedgerConsumer(
                repositories.ledger
            )
        )
   }
}

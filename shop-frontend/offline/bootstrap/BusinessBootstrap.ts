import { DefaultBusinessKernel } from "@/src/BizTru_Karnel/BusinessKernel";
import { CommandValidation } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/CommandValidator";
import { DefaultCommandFactory } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/DefaultCommandFactory";
import { IdGenerator } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/IdGenerators";
import { EventStored } from "@/src/BizTru_Karnel/EventStore/EventStore";
import { KernelExecutionPipeline } from "@/src/BizTru_Karnel/KernelExecutionPipeline/KernelExecutionPipeline";
import { MetadataBuilder } from "@/src/BizTru_Karnel/MetadataBuilder/MetadataBuilder";
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
import { SQLiteBusinessClock } from "@/src/BizTru_Karnel/MetadataBuilder/SQLiteBusinessClock"
import { EventMetadataBuilder } from "@/src/BizTru_Karnel/MetadataBuilder/EventMetadataBuilder"
import { FrontendBusinessContext } from "@/src/Composer/context/BusinessContext";

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

        const domain = 
            await this.createDomain(
                client,
                storage
            )
        
        const synchronization = 
            await this.createSynchronization(
                storage,
                domain
            )
        const application = 
            new BusinessApplication(
                businessId,
                runtime,
                storage,
                domain,
                synchronization
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

   async createRuntime(businessId: string) : Promise<BusinessRuntime> {
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

   async createStorage(runtime: BusinessRuntime): Promise<BusinessStorage>{
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

   async createDomain(
        client: ApplicationContext,
        storage: BusinessStorage
    ): Promise<BusinessDomain> {
    const executionContext =
        client.ExecutionContext
    const metadataBuilder =
        new MetadataBuilder();
    
    const idGenerator = new IdGenerator()
   const eventbus = new EventStored(storage.repositories.events)
    const commandFactory =
        new DefaultCommandFactory(
            executionContext,
            metadataBuilder,
           idGenerator
        )
    const commandValidator =new CommandValidation();
    const clock = 
        new SQLiteBusinessClock(
            storage.repositories.logicClock
        )
    const eventMetadataBuilder = new EventMetadataBuilder();

    const context = new FrontendBusinessContext(
        client.repositories.applicationState
    )
    const pipeline = new KernelExecutionPipeline(
        commandValidator,
        eventbus,
        clock,
        eventMetadataBuilder,
        context
    )
    
    const kernel = new DefaultBusinessKernel(
        pipeline
    )
    
    const services = new BusinessServiceRegistry()
        
    return new BusinessDomain(
        executionContext,
        commandFactory,
        kernel,
        eventbus,
        services
    )
   }

   async createSynchronization(
        storage: BusinessStorage,
        domain: BusinessDomain
    ): Promise<BusinessSynchronization> {
        const buses = new BusinessBusesRegistry()
        return new BusinessSynchronization(buses)
   }
}
import { InMemoryEventBus } from "@business/event-bus";
import { DefaultBusinessKernel } from "../BizTru_Karnel/BusinessKernel";
import { ExecutionContextProvider } from "../BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";
import { CommandValidation } from "../BizTru_Karnel/CommandFactory/factoryDependencies/CommandValidator";
import { DefaultCommandFactory } from "../BizTru_Karnel/CommandFactory/factoryDependencies/DefaultCommandFactory";
import { IdGenerator } from "../BizTru_Karnel/CommandFactory/factoryDependencies/IdGenerators";
import { EventStored } from "../BizTru_Karnel/EventStore/EventStore";
import { KernelExecutionPipeline } from "../BizTru_Karnel/KernelExecutionPipeline/KernelExecutionPipeline";
import { MetadataBuilder } from "../BizTru_Karnel/MetadataBuilder/MetadataBuilder";
import { ExecutionContextRepository } from "../offline/sqlite/clientDatabase/repositories/ExecutionContextRepitory/ExecutionContextRepository";
import { StorageBusCreator } from "../offline/sqlite/bus/StorageBusCreator";
import { BusinessSessionManager } from "../offline/sqlite/worker/sessions/BusinessSessionManager";
import { FrontendExecutionContextBus } from "../eventBus/ExecutionContextSubscriber";
import { DomainEvent } from "@business/shared-types";
import { FrontEndEventBus } from "../eventBus/EventBus";
import { FrontendProjectionBus } from "../eventBus/ProjectionBus";
import { FrontendLedgerBus } from "../eventBus/LedgerBus";
import { FrontendAnalyticBus } from "../eventBus/AnalyticBus";
import { FrontEndNotificationBus } from "../eventBus/NotificationBus";

let app: ReturnType<typeof createApplication> | null = null;
export function createApplication(){
    // Storage
    const storage = StorageBusCreator();
    
    const executionContextRepo = new ExecutionContextRepository(storage);
    

    //Command Factories
    const executionContext = new ExecutionContextProvider(executionContextRepo);
    const commandValidator = new CommandValidation();
    const idGenerator = new IdGenerator();
    const metadataBuilder = new MetadataBuilder();
    const commandactory = new DefaultCommandFactory(executionContext,metadataBuilder,idGenerator)

    //Buses
    const contextBus =  new FrontendExecutionContextBus(executionContextRepo, executionContext);
    const eventBus = new FrontEndEventBus();
    const projectionBus = new FrontendProjectionBus();
    const ledgerBus = new FrontendLedgerBus();
    const analyticBus = new FrontendAnalyticBus();
    const notificationBus = new FrontEndNotificationBus();
    //BusinessKernel
   
    const eventStore  = new EventStored()
    
    

    const businessKernelExecutor =
        new KernelExecutionPipeline(
            commandValidator,
            eventStore,
            contextBus,
            projectionBus,
            ledgerBus,
            eventBus,
            analyticBus,
        );
    const Kernel = new DefaultBusinessKernel(businessKernelExecutor);

    return {
        Kernel,
        commandactory,
        executionContext

    }
}   

export function composer(){
    if(!app){
        app = createApplication();
    }
    return app;
}
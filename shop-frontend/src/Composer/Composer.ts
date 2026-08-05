import { InMemoryEventBus } from "@business/event-bus";
import { DefaultBusinessKernel } from "../BizTru_Karnel/BusinessKernel";
import { ExecutionContextProvider } from "../BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";
import { CommandValidation } from "../BizTru_Karnel/CommandFactory/factoryDependencies/CommandValidator";
import { DefaultCommandFactory } from "../BizTru_Karnel/CommandFactory/factoryDependencies/DefaultCommandFactory";
import { IdGenerator } from "../BizTru_Karnel/CommandFactory/factoryDependencies/IdGenerators";
import { EventStored } from "../BizTru_Karnel/EventStore/EventStore";
import { KernelExecutionPipeline } from "../BizTru_Karnel/KernelExecutionPipeline/KernelExecutionPipeline";
import { MetadataBuilder } from "../BizTru_Karnel/BusinessClock/MetadataBuilder";
import { FrontEndEventBus } from "../offline/sqlite/businessDatabase/BusinessEventBus/EventBus";
import { FrontendProjectionBus } from "../offline/sqlite/businessDatabase/BusinessEventBus/ProjectionBus";
import { FrontendLedgerBus } from "../offline/sqlite/businessDatabase/BusinessEventBus/LedgerBus";
import { FrontendAnalyticBus } from "../offline/sqlite/businessDatabase/BusinessEventBus/AnalyticBus";
import { FrontEndNotificationBus } from "../offline/sqlite/businessDatabase/BusinessEventBus/NotificationBus";
import { ApplicationContext } from "./context/ApplicationContexts";


export class ApplicationComposer {
    constructor(
        private readonly app: 
    ){}
    compose(){
        const executionContext = 
            new ExecutionContextProvider(
                this.app.repositories.executionContext
            )

            const commandValidator = new CommandValidation();
        const idGenerator = new IdGenerator();
        const metadataBuilder = new MetadataBuilder();
        const commandactory = new DefaultCommandFactory(executionContext,metadataBuilder,idGenerator)

        //Buses
    
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
}

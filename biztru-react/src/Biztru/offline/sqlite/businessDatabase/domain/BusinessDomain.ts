import type{ Kernel } from "../../../../BizTru_Karnel/BusinessKernelContract"; 
import type{ CommandFactory } from "../../../../BizTru_Karnel/CommandFactory/factoryDependencies/CommandFactoryContract"; 
import { EventStore } from "../../../../BizTru_Karnel/EventStore/EventStore"; 
import type{ Lifecycle } from "../../lifecycle/LifeCycle";
import { ExecutionContextProvider } from "../../../../BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext"; 

export class BusinessDomain
implements Lifecycle {

    readonly executionContext: ExecutionContextProvider;

    readonly commandFactory: CommandFactory;

    readonly kernel: Kernel;

    readonly eventStore: EventStore
    constructor(
        executionContext: ExecutionContextProvider,

        commandFactory: CommandFactory,

        kernel: Kernel,

        eventStore: EventStore,
    ){
        this.executionContext = executionContext;

        this.commandFactory = commandFactory;

        this.kernel = kernel;

        this.eventStore = eventStore


    }

    async initialize(): Promise<void> {
      await this.executionContext.initialize() 
    }

    async start(): Promise<void> {
        
    }

    async stop(): Promise<void> {
        
    }

    async dispose(): Promise<void> {
        
    }
}
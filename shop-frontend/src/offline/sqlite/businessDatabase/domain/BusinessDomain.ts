import { Kernel } from "@/src/BizTru_Karnel/BusinessKernelContract";
import { CommandFactory } from "@/src/BizTru_Karnel/CommandFactory/factoryDependencies/CommandFactoryContract";
import { ExecutionContext } from "@/src/BizTru_Karnel/KarnelTypes/types";
import { EventStore } from "@/src/BizTru_Karnel/EventStore/EventStore";
import { Lifecycle } from "../../lifecycle/LifeCycle";
import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";
import { ProjectionEventBus } from "@business/event-bus";

export class BusinessDomain
implements Lifecycle {
    readonly buses: ProjectionEventBus;
    constructor(
        readonly executionContext: ExecutionContextProvider,

        readonly commandFactory: CommandFactory,

        readonly kernel: Kernel,

        readonly eventStore: EventStore,
    ){
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
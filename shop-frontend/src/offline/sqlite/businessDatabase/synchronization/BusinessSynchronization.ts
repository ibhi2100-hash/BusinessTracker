import { Lifecycle } from "../../lifecycle/LifeCycle";
import { BusinessBusesRegistry } from "../BusinessEventBus/BusinessBusesRegistry";

export class BusinessSynchronization
implements Lifecycle {
    constructor(
        readonly buses: BusinessBusesRegistry
    ){}

    async initialize(): Promise<void> {
        
    }
    
    async start(): Promise<void> {
        
    }

    async stop(): Promise<void> {
        
    }

    async dispose(): Promise<void> {
        
    }
}
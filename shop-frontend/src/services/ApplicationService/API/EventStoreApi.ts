
import { BusinessManager } from "@/src/Composer/BusinessManager";
import {  DomainEvent } from "@business/shared-types";


export class EventStoreApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async getAllEvent(): Promise<DomainEvent[]>{
        const app = 
            await this.manager.current();
        
        const events = 
            await app.storage.repositories.events.loadAllEvents()
        console.log("This are the events that are saved in this business: ", events)

        return events
    }

    async createBranch(businessId: string, request: CreateBranchRequest) {
        // Implementation for creating a branch
    }
}
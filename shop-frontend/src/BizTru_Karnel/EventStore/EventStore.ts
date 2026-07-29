import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { EventStore } from "../SubKernel/types";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";
import { StoredEventTransformer } from "../Transformers/StoredEventTransformer";
import { BusinessSession } from "@/src/offline/sqlite/worker/sessions/BusinessSessionContract";
import { BusinessSessionManager } from "@/src/offline/sqlite/worker/sessions/BusinessSessionManager";


export class EventStored
implements EventStore {
    private sessions: BusinessSession
    
    constructor(
    ){
        this.sessions =
            BusinessSessionManager.getInstance()
    }
    
    async append(events: readonly DomainEvent[]): Promise<void> {
       for(const event of events){
        if(
            event.type === BusinessEventTypes.BUSINESS_CREATED
        ){
            await this.sessions.createBusiness(event.aggregateId)
        }
        const session = 
            await this.sessions.getSession(event.aggregateId);
        const storedEvent =await StoredEventTransformer(event)
        await session
            .repositories
            .events
            .append([storedEvent])
       }
    }
}
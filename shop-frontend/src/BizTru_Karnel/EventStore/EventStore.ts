import { BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { EventStore } from "../SubKernel/types";
import { StoredEventTransformer } from "../Transformers/StoredEventTransformer";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";


export class EventStored
implements EventStore {
    
    constructor(
       private readonly eventRepository: SQLiteEventRepository
    ){}
    
    async append(events: readonly DomainEvent[]): Promise<void> {
      const stored = 
       events.map(StoredEventTransformer)

        await this.eventRepository.append(stored)
        
    }
}
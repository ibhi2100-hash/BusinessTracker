import { DomainEvent } from "@business/shared-types";
import { SQLiteEventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore";


export class EventStore{
    
    constructor(
       private readonly eventRepository: SQLiteEventRepository
    ){}
    
    async append(events: readonly DomainEvent[]): Promise<void> {

        await this.eventRepository.append(events)
        
    }
}
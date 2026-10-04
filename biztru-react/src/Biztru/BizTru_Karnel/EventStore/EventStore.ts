import type{ DomainEvent } from "@business/shared-types";
import { SQLiteEventRepository } from "../../offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/eventStore"; 


export class EventStore{
    private readonly eventRepository: SQLiteEventRepository;
    constructor(
       eventRepository: SQLiteEventRepository
    ){
        this.eventRepository = eventRepository
    }
    
    async append(events: readonly DomainEvent[]): Promise<void> {

        await this.eventRepository.append(events)
        
    }
}
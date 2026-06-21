import { EventBus } from "@business/event-bus";
import { EventRepository } from "../Contracts/EventRepo";
import { EventMapper } from "../Contracts/EventMapper";
export declare class EventPipeline<TStoredEvent, TPublishedEvent> {
    private readonly repository;
    private readonly mapper;
    private readonly bus;
    constructor(repository: EventRepository<TStoredEvent>, mapper: EventMapper<TStoredEvent, TPublishedEvent>, bus: EventBus<TPublishedEvent>);
    append(event: TStoredEvent): Promise<void>;
    appendMany(events: TStoredEvent[]): Promise<void>;
}

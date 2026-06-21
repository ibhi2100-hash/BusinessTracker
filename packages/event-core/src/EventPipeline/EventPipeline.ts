import { EventBus } from "@business/event-bus";
import { EventRepository} from "../Contracts/EventRepo";
import { EventMapper } from "../Contracts/EventMapper";

export class EventPipeline<
    TStoredEvent,
    TPublishedEvent
> {
    constructor(
        private readonly repository: EventRepository<TStoredEvent>,
        private readonly mapper: EventMapper<TStoredEvent, TPublishedEvent>,
        private readonly bus: EventBus<TPublishedEvent>
    ){}

    async append(event: TStoredEvent): Promise<void> {
        return this.appendMany([event])
    }

    async appendMany(events: TStoredEvent[]): Promise<void>{
        if(events.length === 0) return;

        await this.repository.appendMany(events)

        const publishedEvents =
            this.mapper.mapMany(events);

        await this.bus.publishMany(publishedEvents)
    }
}
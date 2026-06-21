export interface EventMapper<TStoredEvent, TPublishedEvent> {
    map(event: TStoredEvent): TPublishedEvent;

    mapMany(events: TStoredEvent[]): TPublishedEvent[]
}
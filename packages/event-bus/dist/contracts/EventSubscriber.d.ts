export interface EventConsumer<TEvent> {
    handle(events: readonly TEvent[]): Promise<void>;
}

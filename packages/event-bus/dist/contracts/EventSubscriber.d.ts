export interface EventConsumer<TEvent> {
    readonly name: string;
    handle(events: readonly TEvent[]): Promise<void>;
}

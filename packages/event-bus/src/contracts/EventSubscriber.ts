
export interface EventSubscriber<TEvent> {

    handle(
        events: TEvent[]
    ): Promise<void>
}
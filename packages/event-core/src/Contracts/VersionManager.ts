export interface VersionManager<
    TIncomingEvent,
    TCanonicalEvent
> {
    prepare(
        events: readonly TIncomingEvent[]
    ): Promise<TCanonicalEvent[]>;
}
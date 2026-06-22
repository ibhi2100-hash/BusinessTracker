export interface VersionManager<TEvent> {
    prepare(events: readonly TEvent[], currentVersion: number): Promise<TEvent[]>;
}

export interface ProjectionEngine<TEvent> {
    process(event: TEvent): Promise<void>
}
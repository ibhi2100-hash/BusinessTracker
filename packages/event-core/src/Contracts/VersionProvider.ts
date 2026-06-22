export interface AggregateVersionProvider {

    getVersion(
        aggregateId: string
    ): Promise<number>;

}
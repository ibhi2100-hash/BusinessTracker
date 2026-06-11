export interface ProjectionRepository {
    load(projection: string, aggregateId: string): Promise<any>;
    save(projection: string, state: any, next: any): Promise<string>;
}

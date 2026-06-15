export interface ProjectionRepository {
    load(projection: string, aggregateId: string): Promise<any>;
    save(projection: string, aggregateId: any, state: any): Promise<void>;
}

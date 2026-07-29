export interface ProjectionRepository {
    load<T>(projection: string, id: string): Promise<T | null>;
    save<T>(projection: string, id: string, state: T): Promise<void>;
}

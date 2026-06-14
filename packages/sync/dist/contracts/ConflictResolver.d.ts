export interface ConflictResolver {
    resolve(conflict: any): Promise<void>;
}

export interface ClientSessionManagerContract {
    inialize(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
    execute(sql: string, params?: any[]): Promise<void>;
    scalar<T>(sql: string, params?: any[]): Promise<T>;
}
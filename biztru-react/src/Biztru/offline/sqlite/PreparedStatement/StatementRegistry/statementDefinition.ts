export interface StatementDefinition<T = unknown> {

    readonly key: string;

    readonly sql: string;

    readonly mapper?: (
        entity: T
    ) => readonly unknown[];
}
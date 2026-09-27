import { SQLiteStatementOperation } from "@business/shared-types";
export interface EventConsumer<TEvent> {
    readonly name: string;
    handle(events: readonly TEvent[]): Promise<void>;
}
export interface ProjectionOperationConsumer<TEvent> {
    readonly name: string;
    buildOperations(events: readonly TEvent[]): SQLiteStatementOperation[];
}

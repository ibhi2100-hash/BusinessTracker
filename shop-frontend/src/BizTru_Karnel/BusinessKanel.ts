import { Command } from "./KarnelTypes/types";

export interface BusinessKernel {
    execute<TCommand, TResult>(command: TCommand): Promise<TResult>;
    query<TResult>(query: Query<TResult>): Promise<TResult>;
    observe(subscription: EventSubscription): EventStream;
}
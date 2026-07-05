export interface BusinessKernel {
    execute(command: Command): Promise<ExecutionResult>;
    query<TResult>(query: Query<TResult>): Promise<TResult>;
    observe(subscription: EventSubscription): EventStream;
}
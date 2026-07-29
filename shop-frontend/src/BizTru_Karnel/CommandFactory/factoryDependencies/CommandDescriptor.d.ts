export interface CommandDescriptor {
    type: string;
    version: number;
    aggregateType: string;
    aggregateId: string;
    aggregateFactory: AggregateFactory;
    commandExecutor: CommandExecutor;
    validator: CommandValidator;
    reducer: AggregateReducer;
    projectionRunner: ProjectionRunner;
    snapshotPolicy: SnapshotPolicy;
    eventFactory: EventFactory;
}
export interface AggregateDescriptor {
    type: string;
    strategy: AggregateLoadStrategy;
}
export declare enum AggregateLoadStrategy {
    CREATE = 0,
    LOAD = 1,
    OPTIONAL = 2
}
export interface CommandExecutor {
    transactional: boolean;
    snapshot: boolean;
    projections: boolean;
    outbox: boolean;
    publish: boolean;
}
export interface CommandValidator {
    schema: unknown;
    permissions: Permission[];
}
export interface EventDescriptor {
    type: string;
    required: boolean;
}

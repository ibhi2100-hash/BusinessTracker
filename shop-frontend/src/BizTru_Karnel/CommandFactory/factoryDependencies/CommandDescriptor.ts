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

export enum AggregateLoadStrategy {

    CREATE,

    LOAD,

    OPTIONAL

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
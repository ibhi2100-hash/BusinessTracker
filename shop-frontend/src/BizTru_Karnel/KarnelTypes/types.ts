import { Snapshot } from "@/src/offline/repositories/SQLiteSnapshotRepository/SnaphotModel";
import { CommandDescriptor } from "../CommandFactory/CommandDescriptor";
import { CommandMetadata } from "../MetadataBuilder/MetadataBuilderContract";

export interface Command<TPayload = unknown> {

    readonly id: string;

    readonly type: string;

    readonly aggregateId: string;

    readonly aggregateType: string;

    readonly payload: Readonly<TPayload>;

    readonly actor: ActorContext;

    readonly metadata: CommandMetadata;

    readonly version: number;

}
export interface ActorContext {

    userId: string;

    businessId: string;

    branchId?: string;

    deviceId: string;

    sessionId?: string;

}


export interface ExecutionResult {

    success: boolean;

    aggregateId: string;

    aggregateVersion: number;

    events: readonly Event[];

    warnings: readonly BusinessWarning[];

    executionTime: number;

}

export interface BusinessWarning {

    code: string;
    message: string;
}





export interface AuthenticationService{

}

export interface AuthorizationService{

}

export interface AggregateResolver{

}

export interface AggregateRepository{

}

export interface AggregateExecutor{

}       

export interface EventStore{

}

export interface TransactionManager{

}

export interface EventPublisher{
    
}

export interface ProjectionDispatcher{

}

export interface SyncDispatcher{

}

export interface AggregateState {
    readonly id: string;
    readonly version: number;
}

export interface BusinessOperation<
    TState,
    TCommand,
> {
    execute(
        runtime: AggregateRuntimeContext<TState, TCommand>
    ): ExecutionPlan;
}

export interface AggregateLoader {

    load(
        aggregateId
    ): AggregateState;

}

export interface ExecutionPlan {

    events;

    ledgerEntries;

    workflows;

    notifications;

    projections;

}

export interface AggregateRuntimeContext
<
    TState,
    TCommand
>{
    readonly command: Command<TCommand>;

    readonly state: TState;

    readonly descriptor: CommandDescriptor<TCommand>;

    readonly operation: BusinessOperation<TState, TCommand>;


}

export interface AggregateRuntimeFactory {

    create(

        command: Command,

        descriptor: CommandDescriptor<any>

    ): Promise<AggregateRuntimeContext<AggregateState, unknown>>;

}

export interface AggregateRebuilder<
    TState
>{

    rebuild(

        snapshot: Snapshot<TState>|null,

        events: readonly DomainEvent[]

    ): TState;

}

export interface SnapshotLoader {

    load(
        aggregateId
    ): Snapshot | null;

}

export interface EventLoader {

    load(
        aggregateId,
        version
    ): Event[];
}

export interface AggregateMaterializer {

    materialize(

        descriptor: CommandDescriptor<unknown, unknown>,

        command: Command

    ): Promise<AggregateRuntimeContext<AggregateState, unknown>>;

}


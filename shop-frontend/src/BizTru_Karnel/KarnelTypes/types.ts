import { Snapshot } from "@/src/offline/repositories/SQLiteSnapshotRepository/SnaphotModel";
import { CommandDescriptor } from "../CommandFactory/CommandDescriptor";
import { CommandMetadata } from "../MetadataBuilder/MetadataBuilderContract";
import { DomainEvent } from "@business/shared-types";

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
export interface AggregateState {
    readonly id: string;
    readonly version: number;
}

export interface BusinessOperation<
    TState,
    TCommand,
> {
    execute(
        runtime: AggregateRuntimeContext<TState>
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
>{
    readonly command: Command;

    readonly state: TState;

    readonly descriptor: CommandDescriptor;

    readonly operation: BusinessOperation<TState, Command>;


}

export interface AggregateRuntimeFactory {

    create(

        command: Command,

        descriptor: CommandDescriptor

    ): Promise<AggregateRuntimeContext<AggregateState>>;

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

        descriptor: CommandDescriptor,

        command: Command

    ): Promise<AggregateRuntimeContext<AggregateState>>

}


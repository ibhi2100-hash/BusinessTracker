import { Snapshot } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteSnapshotRepository/SnaphotModel";
import { ActorContext, DomainEvent } from "@business/shared-types";

export interface Command<TPayload = unknown> {

    readonly id: string;

    readonly type: string;

    readonly mode: "OPENING" | "LIVE"

    readonly aggregateId: string;

    readonly aggregateType: string;

    readonly payload: Readonly<TPayload>;

    readonly causationId: string;

    readonly correlationId: string;

    readonly status : string;

    readonly actor: ActorContext;

    readonly createdAt: number;

    readonly lastAtemptAt?: number

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


export interface ExecutionContext {

    actorId: string | null;

    email: string | null;

    role: string | null;

    sessionId: string | null;

    deviceId: string;

    businessId: string | null;

    branchId: string | null;

}


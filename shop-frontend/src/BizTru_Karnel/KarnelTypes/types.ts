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

export interface ExecutionContext {

    actorId: string | null;

    email: string | null;

    role: string | null;

    sessionId: string | null;

    deviceId: string;

    businessId: string | null;

    branchId: string | null;

}


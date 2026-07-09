import { IntegrationEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";


export interface TransactionKernel {

    begin(

        session: BusinessSession

    ): Promise<void>;

}

export interface CommitKernel {

    commit(

        session: BusinessSession

    ): Promise<void>;

}

export interface RollbackKernel {

    rollback(

        session: BusinessSession

    ): Promise<void>;

}



export interface AggregateRepository {

    load(

        session: BusinessSession,

        aggregateId: string

    ): Promise<AggregateRoot>;

}


export interface CommandDispatcher {

    dispatch(

        aggregate: AggregateRoot,

        command: BusinessCommand

    ): Promise<BaseEvent[]>;

}

export interface EventStore {

    append(

        session: BusinessSession,

        events: readonly IntegrationEvent[]

    ): Promise<void>;

}

export interface ProjectionEngine {

    project(

        session: BusinessSession,

        events: readonly BaseEvent[]

    ): Promise<void>;

}

export interface SnapshotRepository {

    save(

        session: BusinessSession,

        aggregate: AggregateRoot

    ): Promise<void>;

}

export interface SyncScheduler {

    enqueue(

        session: BusinessSession,

        events: readonly BaseEvent[]

    ): Promise<void>;

}

export interface LocalEventBus {

    publish(

        events: readonly BaseEvent[]

    ): Promise<void>;

}
export interface PipelinePhase {

    execute(
        context: PipelineContext
    ): Promise<void>;

}
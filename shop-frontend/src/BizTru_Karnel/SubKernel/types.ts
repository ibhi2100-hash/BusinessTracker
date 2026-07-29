import { DomainEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";
import { BusinessSession } from "../contracts/SubKernelContracts";


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

        command: Command

    ): Promise<BaseEvent[]>;

}

export interface EventStore {

    append(
        events: readonly DomainEvent[]

    ): Promise<void>;

}

export interface ProjectionEngine {

    project(

        session: BusinessSession,

        events: readonly DomainEvent[]

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

        events: readonly DomainEvent[]

    ): Promise<void>;

}

export interface LocalEventBus {

    publish(

        events: readonly DomainEvent[]

    ): Promise<void>;

}
export interface PipelinePhase {

    execute(
        context: PipelineContext
    ): Promise<void>;

}

export interface BusinessProvisioner {

    provision(
        event: DomainEvent
    ): Promise<void>;

}
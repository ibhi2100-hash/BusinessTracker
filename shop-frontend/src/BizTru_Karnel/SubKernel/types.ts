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


export interface SyncScheduler {

    enqueue(

        session: BusinessSession,

        events: readonly DomainEvent[]

    ): Promise<void>;

}


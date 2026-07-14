import { IntegrationEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";
import { CommandMetadata } from "../MetadataBuilder/MetadataBuilderContract";
import { EventRepository } from "@/src/offline/repositories/SQLiteEventRepository/contracts";

export interface PipelineKernel {

    execute(
        context: PipelineContext
    ): Promise<void>;

}
export interface CommandValidator {

    validate(
        command: Command
    ): Promise<void>;

}

export interface SessionFactory {

    create(
        nodeId: string
    ): Promise<BusinessSession>;

}

export interface DatabaseInitializer {

    initialize(
        session: BusinessSession
    ): Promise<void>;

}
export interface TransactionScope {

    begin(
        session: BusinessSession
    ): Promise<void>;

}

export interface AggregateLoader {

    load<
        TAggregate
    >(
        session: BusinessSession,
        aggregateId: string
    ): Promise<TAggregate>;

}
export interface CommandExecutor {

    execute(
        aggregate: unknown,
        command: unknown
    ): Promise<readonly BaseEvent[]>;

}

export interface EventAppender {

    append(
        session: BusinessSession,
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface ProjectionRunner {

    project(
        session: BusinessSession,
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface SnapshotStore {

    save(
        session: BusinessSession,
        aggregate: unknown,
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface Outbox {

    enqueue(
        session: BusinessSession,
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface SyncQueue {

    schedule(
        session: BusinessSession,
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface EventPublisher {

    publish(
        events: readonly BaseEvent[]
    ): Promise<void>;

}

export interface CommandRouter {

    dispatch(
        aggregate: unknown,
        command: unknown
    ): Promise<readonly BaseEvent[]>;

}

export interface PipelinePhase {

    execute(
        context: PipelineContext
    ): Promise<void>;

}
export interface PreparationPhase
extends PipelinePhase {

}

export interface DomainPhase
extends PipelinePhase {

}

export interface PersistencePhase
extends PipelinePhase {

}

export interface CompletionPhase
extends PipelinePhase {

}

export interface RollbackPhase
extends PipelinePhase {

}

export interface ExecutionEngine {

    execute(
        context: PipelineContext
    ): Promise<void>;

}

export interface PersistenceContext {

    projections: ProjectionResult[];

    snapshots: AggregateSnapshot[];

    outbox: OutboxMessage[];

    syncQueue: SyncTask[];

}

export interface DiagnosticContext {

    startedAt: number;

    completedAt?: number;

    duration?: number;

    currentPhase?: string;

    currentKernel?: string;

}

export interface RuntimeContext {
    nodeId?: string;

    session?: BusinessSession;

    aggregate?: AggregateRoot;

    events: IntegrationEvent[];

    aggregateVersion?: number


}

export interface ExecutionRequest {

    command: Command;

    metadata?: CommandMetadata;

}

export interface ExecutionResult {

    success: boolean;

    aggregateVersion: number;

    aggregateId: string;

    events: readonly IntegrationEvent[];

}

export interface PipelineContext {

    readonly request:
        ExecutionRequest;

    readonly runtime:
        RuntimeContext;

    readonly persistence:
        PersistenceContext;

    readonly diagnostics:
        DiagnosticContext;

    result?: ExecutionResult;

}
export interface NodeResolver {

    resolve(
        businessId: string
    ): Promise<string>;

}

export interface SchemaVerifier {

    verify(
        session: BusinessSession
    ): Promise<void>;

}


export interface SessionProvider {

    open(
        nodeId: string
    ): Promise<BusinessSession>;

    close(): Promise<void>;

    current(): BusinessSession | null;

}

export interface QueryContext {

    query<T>(
        sql: string,
        params?: readonly unknown[]
    ): Promise<T[]>;

    scalar<T>(
        sql: string,
        params?: readonly unknown[]
    ): Promise<T | null>;

    exists(
        sql: string,
        params?: readonly unknown[]
    ): Promise<boolean>;

    execute(
        sql: string,
        params?: readonly unknown[]
    ): Promise<void>;

}

export interface TransactionContext {

    begin(): Promise<void>;

    commit(): Promise<void>;

    rollback(): Promise<void>;

    transaction<T>(
        callback: () => Promise<T>
    ): Promise<T>;

}

export interface SessionLifecycle {

    initialize(): Promise<void>;

    dispose(): Promise<void>;

    isReady(): boolean;

}
export interface SessionMetadata {

    readonly nodeId: string;

}
export interface BusinessSession

extends

    
    TransactionContext,

    SessionLifecycle,

    SessionMetadata

{
    readonly events: 
        EventRepository
}

export interface PipelineContextFactory {

    create(

        command: Command,

    ): PipelineContext;

}
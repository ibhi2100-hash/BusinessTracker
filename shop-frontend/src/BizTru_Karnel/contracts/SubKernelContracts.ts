import { IntegrationEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";

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

export interface RuntimeContext {

    session?: BusinessSession;

    aggregate?: AggregateRoot;

    events: BaseEvent[];

    nodeId: string;

}

export interface ExecutionRequest {

    command: BusinessCommand;

    metadata: CommandMetadata;

}

export interface ExecutionResult {

    success: boolean;

    aggregateVersion: number;

    events: readonly BaseEvent[];

}

export interface PipelineContext {

    request: ExecutionRequest;

    runtime: RuntimeContext;

    persistence: PersistenceContext;

    result?: ExecutionResult;

}

export interface KernelResult {

    continue: boolean;

    reason?: string;

}

export interface NodeResolver {

    resolve(
        businessId: string
    ): Promise<string>;

}

export interface ConnectionManager {

    open(): Promise<void>;

}

export interface SchemaVerifier {

    verify(
        session: BusinessSession
    ): Promise<void>;

}

export interface StatementInitializer {

    initialize(
        session: BusinessSession
    ): Promise<void>;

}
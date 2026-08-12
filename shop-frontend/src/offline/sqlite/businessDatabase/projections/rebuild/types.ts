import { DomainEvent } from "@business/shared-types";

export interface ProjectionRebuildOptions {

    fromLogicalClock?: number;

    toLogicalClock?: number;

    asOf?: Date

    batchSize?: number;
}

export interface ProjectionRebuildResult {

    eventsProcessed: number;

    fromLogicClock: number;

    toLogicClock: number;

    durationMs: number;

}

export interface ProjectionRebuildProgress {
    runId: string;
    status:
        | "RESETTING"
        | "REPLAYING"
        | "COMMITTING"
        | "COMPLETED"
        | "FAILED";

    currentPosition: number;
    totalEvents: number;

    currentEventType?: string;

    processedEvents: number;

    startedAt: string;
}

export interface ProjectionRebuildObserver {

    onResetStarted(): Promise<void>;

    onEventStarted(
        event: DomainEvent
    ): Promise<void>;

    onConsumerStarted(
        event: DomainEvent,
        consumerName: string
    ): Promise<void>;

    onConsumerCompleted(
        event: DomainEvent,
        consumerName: string
    ): Promise<void>;

    onEventCompleted(
        event: DomainEvent
    ): Promise<void>;

    onCompleted(
        result: ProjectionRebuildResult
    ): Promise<void>;

    onFailed(
        error: unknown
    ): Promise<void>;
}
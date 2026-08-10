export type RebuildStatus =
    | "IDLE"
    | "RESETTING"
    | "REPLAYING"
    | "COMMITTING"
    | "COMPLETED"
    | "FAILED";

export interface RebuildEventView {
    position: number;
    id: string;
    type: string;
    status: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED";
}

export interface ConsumerActivity {
    name: string;
    status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
    eventType?: string;
}

export interface ProjectionStatus {
    name: string;
    status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
    rows: number;
}

interface ProjectionRebuilderState {

    status: RebuildStatus;

    runId: string | null;

    totalEvents: number;
    processedEvents: number;

    currentPosition: number | null;

    currentEvent: RebuildEventView | null;

    events: RebuildEventView[];

    consumers: ConsumerActivity[];

    projections: ProjectionStatus[];

    error: string | null;

    startedAt: number | null;
    completedAt: number | null;

    startRebuild: () => Promise<void>;

    reset: () => void;
}
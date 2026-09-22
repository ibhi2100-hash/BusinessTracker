export type ConflictStatus = "PENDING" | "RESOLVED" | "DISCARDED" | "INGNORED";
export interface Conflict {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    expectedAggregateVersion: number;
    aggregateVersion: number;
    status: ConflictStatus;
    payload: string | null;
    createdAt: number;
    resolvedAt: number | null;
    updatedAt: number;
}

export interface SyncSuccess {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    globalPosition: bigint;
    processedAt: string;
}

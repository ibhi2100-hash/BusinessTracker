export declare enum AggregateType {
    BUSINESS = "BUSINESS",
    BRANCH = "BRANCH",
    PRODUCT = "PRODUCT",
    INVENTORY = "INVENTORY",
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    CAPITAL_ACCOUNT = "CAPITAL_ACCOUNT",
    SALE = "SALE",
    EXPENSE = "EXPENSE"
}
export interface AggregateRecord {
    id: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    lastEventId: string;
    lastLogicClock: bigint;
    lastGlobalPosition?: number;
    lastSnapshotVersion?: number;
    updatedAt: Date;
}
export interface ReplicaMeta {
    deviceId: string;
    lastLogicClock: bigint;
}

import { DomainEvent } from "./DomainEvents";
export interface StoredEvent<TPayload = unknown> {
    readonly event: DomainEvent<TPayload>;
    readonly storage: StorageMetadata;
}
export interface StorageMetadata {
    readonly deviceId: string;
    readonly sessionId?: string;
    readonly logicClock: number;
    readonly checksum?: string;
    readonly persistedAt: number;
    readonly eventNumber: bigint;
}

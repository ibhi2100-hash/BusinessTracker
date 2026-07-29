import { DomainEvent, StoredEvent } from "@business/shared-types";

export async function StoredEventTransformer(event: DomainEvent): Promise<StoredEvent>{
    const storageMetadata = {
        deviceId: event.actor.deviceId,
        sessionId: event.actor.sessionId,
        logicClock: event.metadata.logicalClock,
        persistedAt: event.metadata.occuredAt,
        eventNumber: BigInt(event.metadata.logicalClock)
    }
    return {
        event: event,
        storage: storageMetadata
        
    }
}
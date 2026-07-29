export interface DomainEvent<TPayload = unknown> {

    readonly id: string;

    readonly businessId?: string;

    readonly branchId?: string;

    readonly aggregateId: string;

    readonly aggregateType: string;

    readonly aggregateVersion?: number;
    
    readonly expectedAggregateVersion: number;

    readonly type: string;

    readonly mode: "OPENING" | "LIVE"

    readonly payload: Readonly<TPayload>;

    readonly actor: ActorContext,

    readonly metadata: EventMetadata;

}

export interface ActorContext {

    userId: string;

    deviceId: string;

    sessionId?: string;

}
export interface EventMetadata {
    occuredAt: number;
    
    correlationId: string;

    causationId?: string;

    logicalClock: number;

}
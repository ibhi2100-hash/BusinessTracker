export interface DomainEvent<TPayload = unknown> {

    readonly id: string;

    readonly businessId: string;

    readonly branchId: string | null;

    readonly aggregateId: string;

    readonly aggregateType: string;
    
    readonly expectedAggregateVersion: number;

    readonly type: string;

    readonly mode: "OPENING" | "LIVE"

    readonly payload: Readonly<TPayload>;

    readonly actor: ActorContext;

    readonly causationId: string;

    readonly correlationId: string;

    readonly logicClock: number;

    readonly createdAt: number;

    readonly  checksum:  string;

}

export interface ActorContext {

    userId: string;

    deviceId: string;

    sessionId?: string;

}

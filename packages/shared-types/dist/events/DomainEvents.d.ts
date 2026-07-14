export interface DomainEvent<TPayload = unknown> {
    readonly id: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly aggregateVersion?: number;
    readonly expectedAggregateVersion: number;
    readonly type: string;
    readonly mode: "OPENING" | "LIVE";
    readonly payload: Readonly<TPayload>;
    readonly actor: EventActor;
    readonly metadata: DomainEventMetadata;
}
export interface EventActor {
    readonly userId: string;
    readonly businessId: string;
    readonly branchId?: string;
}
export interface DomainEventMetadata {
    readonly occurredAt: number;
    readonly causationId?: string;
    readonly correlationId?: string;
}

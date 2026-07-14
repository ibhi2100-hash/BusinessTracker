export interface CanonicalEvent<TPayload = unknown> {

    readonly id: string;

    readonly aggregateId: string;

    readonly aggregateType: string;

    readonly aggregateVersion: number;

    readonly type: string;

    readonly mode: "OPENING" | "LIVE"

    readonly payload: Readonly<TPayload>;

    readonly businessId: string;

    readonly branchId?: string;

    readonly userId: string;

    readonly deviceId: string;

    readonly occurredAt: Date;

    readonly logicClock: number;

    readonly causationId?: string;

    readonly correlationId?: string;

}
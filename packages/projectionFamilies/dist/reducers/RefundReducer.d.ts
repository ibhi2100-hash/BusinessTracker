import type { DomainEvent, RefundCompletedPayload, RefundProjection } from "@business/shared-types";
export declare class RefundReducer {
    reduce(_state: RefundProjection | null, event: DomainEvent<RefundCompletedPayload>): RefundProjection;
}

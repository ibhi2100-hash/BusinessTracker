export declare const BusinessEventTypes: {
    BUSINESS_CREATED: string;
    BUSINESS_ACTIVATION: string;
    BRANCH_CREATED: string;
};
export declare const financeEventType: {
    ASSET_ADDED: string;
    ASSET_DISPOSED: string;
    EXPENSES_ADDED: string;
    LIABILITY_ADDED: string;
    LIABILITY_REPAYMENT: string;
    CASH_ADDED: string;
    CAPITAL_INJECTION: string;
    CAPITAL_DRAWINGS: string;
    OPENING_CAPITAL: string;
    BRANCH_TRANSFER_OUT: string;
    BRANCH_TRANSFER_IN: string;
};
export declare const InventoryEventType: {
    PRODUCT_CREATED: string;
    PRODUCT_UPDATED: string;
    PRODUCT_DELETED: string;
    INVENTORY_ADDED: string;
    INVENTORY_UPDATED: string;
};
export declare const OpeninigEventType: {
    OPENING_INVENTORY_CREATED: string;
    OPENING_INVENTORY_UPDATED: string;
    OPENING_INVENTORY_DELETED: string;
    OPENING_ASSET: string;
    OPENING_LIABILITIES: string;
    OPENING_CASH_ADDED: string;
};
export declare const salesEventType: {
    SALE_ADDED: string;
};
export type EventScope = "GLOBAL" | "BUSINESS" | "BRANCH";
export interface Event {
    id: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion?: number;
    expectedAggregateVersion?: number | null;
    type: string;
    payload: any;
    businessId?: string | null;
    branchId?: string | null;
    branchBusinessId?: string | null;
    mode: "OPENING" | "LIVE";
    logicClock: bigint;
    scope: EventScope;
    deviceId: string;
    userId?: string | null;
    status: "PENDING" | "SYNCED" | "FAILED" | "DEAD";
    synced: boolean;
    isCreationEvent: boolean;
    causationId?: string;
    correlationId?: string;
    createdAt: Date;
}

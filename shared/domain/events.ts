export const BusinessEventTypes = {
    BUSINESS_CREATED: "BUSINESS_CREATED",
    BUSINESS_ACTIVATION: "BUSINESS_ACTIVATION",
    BRANCH_CREATED: "BRANCH_CREATED"
}
export const financeEventType = {
    ASSET_ADDED: "ASSET_ADDED",
    ASSET_DISPOSED: "ASSET_DISPOSED",
    EXPENSES_ADDED: "EXPENSES_ADDED",
    LIABILITY_ADDED: "LIABILITY_ADDED",
    LIABILITY_REPAYMENT: "LIABILITY_REPAYMENT",
    CASH_ADDED: "CASH_ADDED",
    CAPITAL_INJECTION: "CAPITAL_INJECTION",
    CAPITAL_DRAWINGS: "CAPITAL_WITHDRAWAL",
    OPENING_CAPITAL: "OPENING_CAPITAL",

    //Branch-Transfer
    BRANCH_TRANSFER_OUT: "BRANCH_TRANSFER_OUT",
    BRANCH_TRANSFER_IN: "BRANCH_TRANSFER_IN"
}

export const InventoryEventType = {
    PRODUCT_CREATED: "PRODUCT_CREATED",
    PRODUCT_UPDATED: "PRODUCT_UPDATED",
    PRODUCT_DELETED: "PRODUCT_DELETED", 
    INVENTORY_ADDED: "INVENTORY_ADDED",
    INVENTORY_UPDATED: "INVENTORY_UPDATED",
}
export const OpeninigEventType = {
    OPENING_INVENTORY_CREATED: "OPENING_INVENTORY_CREATED",
    OPENING_INVENTORY_UPDATED: "OPENING_INVENTORY_UPDATED",
    OPENING_INVENTORY_DELETED: "OPENING_INVENTORY_DELETED",
    OPENING_ASSET : "OPENING_ASSET",
    OPENING_LIABILITIES: "OPENING_LIABILITIES",
    OPENING_CASH_ADDED: "OPENING_CASH"
}

export const salesEventType = {
        SALE_ADDED: "SALE_ADDED"
}

export type EventScope = "GLOBAL" | "BUSINESS" | "BRANCH";  

export interface Event {
  // EVENT ID
  id: string;

  // STREAM / AGGREGATE
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;

  expectedAggregateVersion?: number | null;

  // EVENT INFO
  type: string;
  payload: any;

  // TENANCY
  businessId?: string | null;

  branchId?: string | null;
  branchBusinessId?: string | null;

  // OPERATING MODE
  mode: "OPENING" | "LIVE";


  // DEVICE ORDERING
  logicClock: bigint;

  // SYNC SCOPE
  scope: EventScope;

  // EVENT ORIGIN
  deviceId: string;
  userId?: string | null;

  // SYNC STATUS
  status: "PENDING" | "SYNCED" | "FAILED";

  synced: boolean;
  isCreationEvent: boolean;
  causationId?: string;
  correlationId?: string;

  // TIMESTAMPS
  createdAt: Date;
}
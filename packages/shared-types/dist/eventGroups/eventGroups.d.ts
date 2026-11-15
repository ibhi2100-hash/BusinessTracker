export declare const BusinessEventTypes: {
    BUSINESS_CREATED: string;
    BUSINESS_ACTIVATION: string;
    BRANCH_CREATED: string;
    BRANCH_SWITCH: string;
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
    PRODUCT_BARCODE_ASSIGN: string;
    INVENTORY_ADDED: string;
    INVENTORY_UPDATED: string;
    INVENTORY_SOLD: string;
    INVENTORY_ADJUSTED: string;
    INVENTORY_TRANSFER: string;
    INVENTORY_RECEIVED: string;
};
export declare const OpeningEventType: {
    OPENING_INVENTORY_CREATED: string;
    OPENING_INVENTORY_UPDATED: string;
    OPENING_INVENTORY_DELETED: string;
    OPENING_ASSET: string;
    OPENING_LIABILITIES: string;
    OPENING_CASH_ADDED: string;
};
export declare const salesEventType: {
    SALE_ADDED: string;
    SALE_VOIDED: string;
    SALE_REFUNDED: string;
};
export declare const expenseEventType: {
    readonly EXPENSE_RECORDED: "EXPENSE_RECORDED";
    readonly EXPENSE_VOIDED: "EXPENSE_VOIDED";
    readonly EXPENSE_REIMBURSED: "EXPENSE_REIMBURSED";
};
export declare const userEventTypes: {
    CREATE_USER: string;
    LOGIN_USER: string;
};
export declare const EmployeeEventType: {
    readonly EMPLOYEE_INVITED: "EMPLOYEE_INVITED";
    readonly EMPLOYEE_INVITATION_ACCEPTED: "EMPLOYEE_INVITATION_ACCEPTED";
    readonly EMPLOYEE_INVITATION_REVOKED: "EMPLOYEE_INVITATION_REVOKED";
    readonly EMPLOYEE_INVITATION_EXPIRED: "EMPLOYEE_INVITATION_EXPIRED";
    readonly EMPLOYEE_ACTIVATED: "EMPLOYEE_ACTIVATED";
    readonly EMPLOYEE_SUSPENDED: "EMPLOYEE_SUSPENDED";
    readonly EMPLOYEE_REACTIVATED: "EMPLOYEE_REACTIVATED";
    readonly EMPLOYEE_REMOVED: "EMPLOYEE_REMOVED";
    readonly EMPLOYEE_ROLE_CHANGED: "EMPLOYEE_ROLE_CHANGED";
    readonly EMPLOYEE_BRANCH_CHANGED: "EMPLOYEE_BRANCH_CHANGED";
    readonly EMPLOYEE_COMPENSATION_SET: "EMPLOYEE_COMPENSATION_SET";
    readonly EMPLOYEE_COMPENSATION_CHANGED: "EMPLOYEE_COMPENSATION_CHANGED";
    readonly EMPLOYEE_REQUEST_SUBMITTED: "EMPLOYEE_REQUEST_SUBMITTED";
    readonly EMPLOYEE_REQUEST_ASSIGNED: "EMPLOYEE_REQUEST_ASSIGNED";
    readonly EMPLOYEE_REQUEST_APPROVED: "EMPLOYEE_REQUEST_APPROVED";
    readonly EMPLOYEE_REQUEST_REJECTED: "EMPLOYEE_REQUEST_REJECTED";
    readonly EMPLOYEE_REQUEST_CANCELLED: "EMPLOYEE_REQUEST_CANCELLED";
};
export type EmployeeEventType = typeof EmployeeEventType[keyof typeof EmployeeEventType];
/**
 * BILLING — PLAN CATALOG EVENTS
 *
 * Plans are versioned catalog definitions.
 * Publishing a new version must not mutate existing subscription history.
 */
export declare const PlanEventType: {
    readonly PLAN_CREATED: "PLAN_CREATED";
    readonly PLAN_UPDATED: "PLAN_UPDATED";
    readonly PLAN_PUBLISHED: "PLAN_PUBLISHED";
    readonly PLAN_RETIRED: "PLAN_RETIRED";
    readonly PLAN_ARCHIVED: "PLAN_ARCHIVED";
};
export type PlanEventType = typeof PlanEventType[keyof typeof PlanEventType];
/**
 * BILLING — SUBSCRIPTION EVENTS
 *
 * A subscription belongs to a business, not an individual branch or device.
 * Each branch/device maintains a replicated local projection of this state.
 */
export declare const SubscriptionEventType: {
    readonly SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED";
    readonly SUBSCRIPTION_ACTIVATED: "SUBSCRIPTION_ACTIVATED";
    readonly SUBSCRIPTION_RENEWED: "SUBSCRIPTION_RENEWED";
    readonly SUBSCRIPTION_UPGRADED: "SUBSCRIPTION_UPGRADED";
    readonly SUBSCRIPTION_DOWNGRADED: "SUBSCRIPTION_DOWNGRADED";
    readonly SUBSCRIPTION_PLAN_CHANGED: "SUBSCRIPTION_PLAN_CHANGED";
    readonly SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELLED";
    readonly SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED";
    readonly SUBSCRIPTION_SUSPENDED: "SUBSCRIPTION_SUSPENDED";
    readonly SUBSCRIPTION_REACTIVATED: "SUBSCRIPTION_REACTIVATED";
    readonly SUBSCRIPTION_GRACE_PERIOD_STARTED: "SUBSCRIPTION_GRACE_PERIOD_STARTED";
    readonly SUBSCRIPTION_GRACE_PERIOD_ENDED: "SUBSCRIPTION_GRACE_PERIOD_ENDED";
};
export type SubscriptionEventType = typeof SubscriptionEventType[keyof typeof SubscriptionEventType];
/**
 * BILLING — ENTITLEMENT EVENTS
 *
 * Entitlements describe the capabilities and limits a business
 * is allowed to use under its effective subscription.
 */
export declare const EntitlementEventType: {
    readonly ENTITLEMENT_GRANTED: "ENTITLEMENT_GRANTED";
    readonly ENTITLEMENT_REVOKED: "ENTITLEMENT_REVOKED";
    readonly ENTITLEMENT_UPDATED: "ENTITLEMENT_UPDATED";
    readonly ENTITLEMENT_OVERRIDE_CREATED: "ENTITLEMENT_OVERRIDE_CREATED";
    readonly ENTITLEMENT_OVERRIDE_UPDATED: "ENTITLEMENT_OVERRIDE_UPDATED";
    readonly ENTITLEMENT_OVERRIDE_REMOVED: "ENTITLEMENT_OVERRIDE_REMOVED";
    readonly ENTITLEMENT_QUOTA_CHANGED: "ENTITLEMENT_QUOTA_CHANGED";
};
export type EntitlementEventType = typeof EntitlementEventType[keyof typeof EntitlementEventType];
/**
 * BILLING — INVOICE EVENTS
 *
 * Invoice events represent billing obligations and their lifecycle.
 */
export declare const InvoiceEventType: {
    readonly INVOICE_CREATED: "INVOICE_CREATED";
    readonly INVOICE_UPDATED: "INVOICE_UPDATED";
    readonly INVOICE_ISSUED: "INVOICE_ISSUED";
    readonly INVOICE_VOIDED: "INVOICE_VOIDED";
    readonly INVOICE_OVERDUE: "INVOICE_OVERDUE";
    readonly INVOICE_SETTLED: "INVOICE_SETTLED";
    readonly INVOICE_CANCELLED: "INVOICE_CANCELLED";
};
export type InvoiceEventType = typeof InvoiceEventType[keyof typeof InvoiceEventType];
/**
 * BILLING — PAYMENT EVENTS
 *
 * Payment records should only be confirmed through a trusted payment
 * verification process, not merely because a device is offline.
 */
export declare const PaymentEventType: {
    readonly PAYMENT_INITIATED: "PAYMENT_INITIATED";
    readonly PAYMENT_RECORDED: "PAYMENT_RECORDED";
    readonly PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly PAYMENT_REVERSED: "PAYMENT_REVERSED";
    readonly PAYMENT_REFUNDED: "PAYMENT_REFUNDED";
};
export type PaymentEventType = typeof PaymentEventType[keyof typeof PaymentEventType];
/**
 * BILLING — SUBSCRIPTION REQUEST EVENTS
 *
 * Used when a device requests a subscription action while offline
 * or while awaiting trusted payment confirmation.
 */
export declare const SubscriptionRequestEventType: {
    readonly SUBSCRIPTION_REQUESTED: "SUBSCRIPTION_REQUESTED";
    readonly SUBSCRIPTION_REQUEST_APPROVED: "SUBSCRIPTION_REQUEST_APPROVED";
    readonly SUBSCRIPTION_REQUEST_REJECTED: "SUBSCRIPTION_REQUEST_REJECTED";
    readonly SUBSCRIPTION_REQUEST_CANCELLED: "SUBSCRIPTION_REQUEST_CANCELLED";
};
export type SubscriptionRequestEventType = typeof SubscriptionRequestEventType[keyof typeof SubscriptionRequestEventType];
/**
 * BILLING — OFFLINE SUBSCRIPTION AUTHORITY EVENTS
 *
 * These events represent the issuance, renewal, or revocation
 * of authority-signed offline entitlement leases.
 */
export declare const SubscriptionLeaseEventType: {
    readonly SUBSCRIPTION_LEASE_ISSUED: "SUBSCRIPTION_LEASE_ISSUED";
    readonly SUBSCRIPTION_LEASE_RENEWED: "SUBSCRIPTION_LEASE_RENEWED";
    readonly SUBSCRIPTION_LEASE_REVOKED: "SUBSCRIPTION_LEASE_REVOKED";
};
export type SubscriptionLeaseEventType = typeof SubscriptionLeaseEventType[keyof typeof SubscriptionLeaseEventType];

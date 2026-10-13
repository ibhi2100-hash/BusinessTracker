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

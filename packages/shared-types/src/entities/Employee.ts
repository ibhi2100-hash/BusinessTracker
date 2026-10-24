export type EmployeeRole =
    | "ADMIN"
    | "MANAGER"
    | "STAFF";

export type EmploymentStatus =
    | "INVITED"
    | "ACTIVE"
    | "SUSPENDED"
    | "REMOVED";

export type EmployeeInvitationStatus =
    | "PENDING"
    | "ACCEPTED"
    | "EXPIRED"
    | "REVOKED";

export type EmployeeRequestType =
    | "LEAVE"
    | "EXPENSE"
    | "PURCHASE"
    | "STOCK_ADJUSTMENT"
    | "SHIFT_CHANGE"
    | "ACCESS"
    | "OTHER";

export type EmployeeRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";

export type EmployeeRequestPriority =
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT";

export type PayFrequency =
    | "MONTHLY"
    | "WEEKLY"
    | "DAILY"
    | "HOURLY";

export interface Employee {
    id: string;

    businessId: string;

    branchId: string | null;

    userId: string | null;

    reportsToEmployeeId: string | null;

    employeeNumber: string | null;

    fullName: string;

    phone: string | null

    email: string | null;

    role: EmployeeRole;

    employmentStatus: EmploymentStatus;

    joinedAt: number | null;

    createdAt: number;

    updatedAt: number;

    version: number
}

export interface EmployeeCompensation {
    id: string;

    businessId: string;

    employeeId: string;

    branchId: string | null;

    currency: string;

    payFrequency: PayFrequency;

    baseSalary: number;

    housingAllowance: number;

    transportAllowance: number;

    mealAllowance: number;

    otherAllowance: number;

    employerPension: number;

    employerTax: number;

    otherEmployerCost: number;

    commissionRate: number;

    effectiveFrom: number;

    effectiveTo: number | null;

    createdAt: number;

    updatedAt: number;

    version: number;
}

export interface EmployeeCompensationHistory {
  id: string;
  businessId: string;
  employeeId: string;
  branchId: string | null;
  currency: string;
  payFrequency: string;
  baseSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  otherAllowances: number;
  employerPension: number;
  employerTax: number;
  otherEmployerCost: number;
  commissionRate: number;
  effectiveFrom: number;
  effectiveTo: number | null;
  createdAt: number;
  updatedAt: number;
  version: number;
}
export interface EmployeeRequest {
    id: string;

    businessId: string;

    branchId: string | null;

    requesterEmployeeId: string;

    assignedToEmployeeId: string | null;

    type: EmployeeRequestType;

    title: string;

    description: string | null;

    status: EmployeeRequestStatus;

    priority: EmployeeRequestPriority;

    amount: number | null;

    currency: string | null;

    submittedAt: number;

    resolvedAt: number | null;

    resolutionNote: string | null;

    createdAt: number;

    updatedAt: number;

    version: number;
}

export interface EmployeeInvitation {
    id: string;

    businessId: string;

    employeeId: string;

    branchId: string | null;

    email: string | null;

    phone: string | null;

    role: EmployeeRole;

    status: EmployeeInvitationStatus;

    tokenHash?: string;

    expiresAt: number | null;

    createdAt: number;

    acceptedAt: number | null;

    revokedAt: number | null;

    updatedAt: number;

    version: number
}

export interface EmployeePayload {
    branchId: string | null;

    employeeNumber: string | null;

    reportsToEmployeeId: string | null;

    fullName: string;

    userId: string | null

    phone: string | null;

    email: string | null;

    role: EmployeeRole;
}
export interface EmployeeCompensationPayload {
    employeeId: string;

    branchId: string | null;

    currency?: string;

    payFrequency: PayFrequency;

    baseSalary: number;

    housingAllowance: number;

    transportAllowance: number;

    mealAllowance: number;

    otherAllowance: number;

    employerPension: number;

    employerTax: number;

    otherEmployerCost: number;

    commissionRate: number;

    effectiveFrom: number;

    effectiveTo: number;
}

export interface EmployeeRequestPayload {
    branchId: string | null;
    employeeId: string ;
    requesterEmployeeId: string;

    assignedToEmployeeId: string | null;

    type: EmployeeRequestType;

    title: string;

    description: string;

    status: EmployeeRequestStatus;

    priority: EmployeeRequestPriority;

    amount: number | null;

    note: string | null

    currency: string | null;

}

export interface EmployeeInvitationPayload {
    invitationId: string;

    employeeId: string;

    branchId: string | null;

    email: string | null;

    phone: string | null;

    role: EmployeeRole;

    tokenHash?: string;

    expiresAt: number | null;


}

export type EmployeeInvitedPayload =
  EmployeePayload &
  EmployeeInvitationPayload;
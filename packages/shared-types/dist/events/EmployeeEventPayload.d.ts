import type { EmployeeRole, EmployeeRequestPriority, EmployeeRequestType, EmployeeCompensationPayload } from "../entities/Employee.js";
import { DomainEvent } from "./DomainEvents.js";
export interface EmployeeInvitedPayload {
    branchId: string | null;
    employeeNumber: string | null;
    fullName: string;
    phone: string | null;
    email: string | null;
    role: EmployeeRole;
}
export interface EmployeeInvitationAcceptedPayload {
    userId: string;
}
export interface EmployeeActivatedPayload {
    userId: string;
    joinedAt: number;
}
export interface EmployeeSuspendedPayload {
    reason: string | null;
}
export interface EmployeeReactivatedPayload {
    reason: string | null;
}
export interface EmployeeRemovedPayload {
    reason: string | null;
}
export interface EmployeeRoleChangedPayload {
    role: EmployeeRole;
}
export interface EmployeeBranchChangedPayload {
    branchId: string | null;
}
export interface EmployeeRequestSubmittedPayload {
    branchId: string | null;
    requesterEmployeeId: string;
    assignedToEmployeeId: string | null;
    type: EmployeeRequestType;
    title: string;
    description: string | null;
    priority: EmployeeRequestPriority;
    amount: number | null;
    currency: string | null;
}
export interface EmployeeRequestAssignedPayload {
    employeeId: string;
}
export interface EmployeeRequestResolutionPayload {
    note: string | null;
}
export type EmployeeDomainEvent = DomainEvent<EmployeeInvitedPayload> | DomainEvent<EmployeeActivatedPayload> | DomainEvent<EmployeeRoleChangedPayload> | DomainEvent<EmployeeBranchChangedPayload> | DomainEvent<EmployeeCompensationPayload> | DomainEvent<EmployeeRequestSubmittedPayload> | DomainEvent<EmployeeRequestAssignedPayload> | DomainEvent<EmployeeRequestResolutionPayload>;

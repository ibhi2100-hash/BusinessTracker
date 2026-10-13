import type { Employee, EmployeeInvitation, EmployeeRequest, EmployeeRole, EmploymentStatus } from "@business/shared-types";



export type EmployeeRequestPriority =
  | "LOW"
  | "NORMAL"
  | "HIGH"
  | "URGENT";


export interface InviteEmployeeRequest {
  fullName: string;
  phone: string;
  email?: string | null;
  role: Exclude<EmployeeRole, "ADMIN">;
  branchId: string | null;
  branchName: string | null;
  employeeNumber?: string;
  employmentStatus: EmploymentStatus
}

export interface inviteEmployeePayload {
    id: string;
    fullName: string;
    phone: string;
    email?: string | null;
    role: Exclude<EmployeeRole, "ADMIN">;
    branchId: string | null;
    branchName: string | null;
    employeeNumber?: string;
    employmentStatus: EmploymentStatus
}

export interface ChangeEmployeeRoleInput {
  employeeId: string;
  role: EmployeeRole;
}

export interface ChangeEmployeeBranchInput {
  employeeId: string;
  branchId: string | null;
}

export interface SubmitEmployeeRequestInput {
  branchId: string | null;
  type: string;
  title: string;
  description?: string;
  priority?: EmployeeRequestPriority;
  amount?: number;
  currency?: string;
  assignedToEmployeeId?: string;
}

export interface ResolveEmployeeRequestInput {
  requestId: string;
  note?: string;
}

export interface EmployeeListFilters {
  branchId?: string;
  status?: EmploymentStatus;
  role?: EmployeeRole;
  search?: string;
}

export interface EmployeeApi {
  // Employee directory
  list(
    filters?: EmployeeListFilters
  ): Promise<Employee[]>;

  getById(
    employeeId: string
  ): Promise<Employee | null>;

  getByUserId(
    userId: string
  ): Promise<Employee | null>;

  // Invitations and employment
  invite(
    input: InviteEmployeeRequest
  ): Promise<EmployeeInvitation>;

  suspend(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  reactivate(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  remove(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  changeRole(
    input: ChangeEmployeeRoleInput
  ): Promise<void>;

  changeBranch(
    input: ChangeEmployeeBranchInput
  ): Promise<void>;

  // Employee requests
  submitRequest(
    input: SubmitEmployeeRequestInput
  ): Promise<EmployeeRequest>;

  listRequests(): Promise<EmployeeRequest[]>;

  assignRequest(
    requestId: string,
    employeeId: string
  ): Promise<void>;

  approveRequest(
    input: ResolveEmployeeRequestInput
  ): Promise<void>;

  rejectRequest(
    input: ResolveEmployeeRequestInput
  ): Promise<void>;

  cancelRequest(
    requestId: string
  ): Promise<void>;
}

/**
 * This gateway must be implemented by your existing application
 * command/query services. It is deliberately not a SQLite repository.
 */
export interface EmployeeCommandQueryGateway {
  listEmployees(
    filters?: EmployeeListFilters
  ): Promise<Employee[]>;

  getEmployeeById(
    employeeId: string
  ): Promise<Employee | null>;

  getEmployeeByUserId(
    userId: string
  ): Promise<Employee | null>;

  inviteEmployee(
    input: InviteEmployeeRequest
  ): Promise<EmployeeInvitation>;

  suspendEmployee(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  reactivateEmployee(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  removeEmployee(
    employeeId: string,
    reason?: string
  ): Promise<void>;

  changeEmployeeRole(
    input: ChangeEmployeeRoleInput
  ): Promise<void>;

  changeEmployeeBranch(
    input: ChangeEmployeeBranchInput
  ): Promise<void>;

  submitEmployeeRequest(
    input: SubmitEmployeeRequestInput
  ): Promise<EmployeeRequest>;

  listEmployeeRequests(): Promise<EmployeeRequest[]>;

  assignEmployeeRequest(
    requestId: string,
    employeeId: string
  ): Promise<void>;

  approveEmployeeRequest(
    input: ResolveEmployeeRequestInput
  ): Promise<void>;

  rejectEmployeeRequest(
    input: ResolveEmployeeRequestInput
  ): Promise<void>;

  cancelEmployeeRequest(
    requestId: string
  ): Promise<void>;
}

export function createEmployeeApi(
  gateway: EmployeeCommandQueryGateway
): EmployeeApi {
  return {
    list: (filters) =>
      gateway.listEmployees(filters),

    getById: (employeeId) =>
      gateway.getEmployeeById(employeeId),

    getByUserId: (userId) =>
      gateway.getEmployeeByUserId(userId),

    invite: (input) => {
      const fullName = input.fullName.trim();
      const phone = input.phone.trim();
      const email = input.email?.trim() || undefined;

      if (!fullName) {
        throw new Error("Employee name is required.");
      }

      if (!phone) {
        throw new Error("Employee phone number is required.");
      }

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        throw new Error("Enter a valid email address.");
      }

      if (
        input.role !== "STAFF" &&
        input.role !== "MANAGER"
      ) {
        throw new Error(
          "Only STAFF or MANAGER can be invited through this operation."
        );
      }

      return gateway.inviteEmployee({
        ...input,
        fullName,
        phone,
        email,
      });
    },

    suspend: (employeeId, reason) =>
      gateway.suspendEmployee(employeeId, reason),

    reactivate: (employeeId, reason) =>
      gateway.reactivateEmployee(employeeId, reason),

    remove: (employeeId, reason) =>
      gateway.removeEmployee(employeeId, reason),

    changeRole: (input) =>
      gateway.changeEmployeeRole(input),

    changeBranch: (input) =>
      gateway.changeEmployeeBranch(input),

    submitRequest: (input) => {
      const title = input.title.trim();

      if (!title) {
        throw new Error("Request title is required.");
      }

      if (!input.type.trim()) {
        throw new Error("Request type is required.");
      }

      if (
        input.amount !== undefined &&
        (!Number.isFinite(input.amount) || input.amount < 0)
      ) {
        throw new Error(
          "Request amount must be a valid non-negative number."
        );
      }

      return gateway.submitEmployeeRequest({
        ...input,
        title,
        type: input.type.trim(),
      });
    },

    listRequests: () =>
      gateway.listEmployeeRequests(),

    assignRequest: (requestId, employeeId) =>
      gateway.assignEmployeeRequest(requestId, employeeId),

    approveRequest: (input) =>
      gateway.approveEmployeeRequest(input),

    rejectRequest: (input) =>
      gateway.rejectEmployeeRequest(input),

    cancelRequest: (requestId) =>
      gateway.cancelEmployeeRequest(requestId),
  };
}

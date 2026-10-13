
import { apiFetch } from "../../../../../lib/api";
import { BusinessManager } from "../../../../Composer/BusinessManager";
import { changeNotifier } from "../../../../offline/sqlite/businessDatabase/projections/changeNoifier";
import { TransactionManager } from "../../../../storage/transaction/TransactionManager";

import {
    type Employee,
    type EmployeeInvitation,
    type EmployeeRequest,
    type EmployeeRole,
    type EmploymentStatus,
    type EmployeeRequestPriority,
    EmployeeEventType,
} from "@business/shared-types";
import type { inviteEmployeePayload, InviteEmployeeRequest } from "./EmployeeRequests";
import type { CommandIntent } from "../../../../BizTru_Karnel/CommandFactory/CommandIntent";
import { AggregateType } from "../../../../../offline/domain/aggregate";

export interface InviteEmployeeInput {
    fullName: string;
    phone: string;
    email: string | null;
    role: Exclude<EmployeeRole, "ADMIN">;
    branchId: string | null;
    employeeNumber?: string | null;
}

export interface SubmitEmployeeRequestInput {
    branchId: string | null;
    type: string;
    title: string;
    description: string | null;
    priority: EmployeeRequestPriority;
    amount: number | null;
    currency: string | null;
    assignedToEmployeeId: string | null;
}

export interface ResolveEmployeeRequestInput {
    requestId: string;
    note: string | null;
}

export interface SetEmployeeCompensationInput {
    employeeId: string;
    branchId: string | null;
    currency: string;
    payFrequency: string;
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
}

export interface EmployeeApiFilters {
    branchId?: string | null;
    role?: EmployeeRole;
    employmentStatus?: EmploymentStatus;
    search?: string;
}

export interface EmployeeRequestFilters {
    branchId?: string | null;
    status?: string;
    assignedToEmployeeId?: string;
}

export interface AcceptEmployeeInvitationInput {
    invitationId: string;
    token: string;
    password: string;
}

export class EmployeeApi {
    private readonly manager: BusinessManager;
    private readonly clientTransactionManager: TransactionManager;

    constructor(
        manager: BusinessManager,
        clientTransactionManager: TransactionManager,
    ) {
        this.manager = manager
        this.clientTransactionManager = clientTransactionManager;
    }


    // =========================================================
    // EMPLOYEE DIRECTORY
    // =========================================================

    async listEmployees(filters?: EmployeeApiFilters): Promise<Employee[]> {
        return this.queries.listEmployees(filters);
    }

    async getEmployee(employeeId: string): Promise<Employee | null> {
        return this.queries.getEmployee(employeeId);
    }

    async getEmployeeByUserId(userId: string): Promise<Employee | null> {
        return this.queries.getEmployeeByUserId(userId);
    }

    async getEmployeesByBranch(branchId: string): Promise<Employee[]> {
        return this.queries.getEmployeesByBranch(branchId);
    }

    async getDirectReports(employeeId: string): Promise<Employee[]> {
        return this.queries.getDirectReports(employeeId);
    }

    // =========================================================
    // INVITATIONS
    // =========================================================

    /**
     * The command factory must persist the employee-invited event and
     * outbox record atomically. Backend delivery is tracked separately.
     */
    async inviteEmployee(input: InviteEmployeeRequest): Promise<EmployeeInvitation> {
        const fullName = input.fullName.trim();
        const phone = input.phone.trim();
        const email = input.email?.trim() || null;

        if (!fullName) throw new Error("Employee name is required.");
        if (!phone) throw new Error("Employee phone is required.");

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            throw new Error("Enter a valid email")
        }
        if (input.role !== "STAFF" && input.role !== "MANAGER") {
            throw new Error("Only STAFF and MANAGER invitations are allowed here.");
        }
        const app = await this.manager.current();
        const employeeIntent: CommandIntent<inviteEmployeePayload> = {
            aggregateId: crypto.randomUUID(),
            aggregateType: AggregateType.EMPLOYEE,
            type: EmployeeEventType.EMPLOYEE_INVITED,
            payload: {
                id: crypto.randomUUID(),
                fullName: input.fullName,
                phone: input.phone,
                email: input.email ?? null,
                role: input.role ?? "STAFF",
                branchId: input.branchId,
                branchName: input.branchName ?? null,
                employeeNumber: input.employeeNumber,
                employmentStatus: input.employmentStatus ?? "INVITED"
            },
            mode: "LIVE"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        };
        const command = await app?.domain.commandFactory.create(employeeIntent);
        if(!command){
            throw new Error("Command can not be created")
        }
        await app?.domain.kernel.execute(command)
    }

    async resendInvitation(invitationId: string): Promise<void> {
        if (!invitationId.trim()) {
            throw new Error("Invitation ID is required.");
        }

    }

    async revokeInvitation(
        invitationId: string,
        reason: string | null = null,
    ): Promise<void> {
    }

    /**
     * Public invitation acceptance is normally called before the worker
     * has an authenticated application session. The one-time invitation
     * token, not an existing employee access token, authorizes this request.
     */
    async acceptInvitation(
        input: AcceptEmployeeInvitationInput,
    ): Promise<void> {
        if (!input.invitationId.trim() || !input.token.trim()) {
            throw new Error("Invitation ID and token are required.");
        }

        if (input.password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/employees/invitations/accept`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            },
        );

        await this.requireSuccess(response, "Accepting employee invitation");
    }

    async activateEmployee(employeeId: string): Promise<void> {
        await this.commands.activateEmployee(employeeId);
        this.notify("employees", "employee_notifications");
    }

    async suspendEmployee(
        employeeId: string,
        reason?: string,
    ): Promise<void> {
        await this.commands.suspendEmployee(employeeId, reason);
        this.notify("employees", "employee_notifications");
    }

    async reactivateEmployee(
        employeeId: string,
        reason?: string,
    ): Promise<void> {
        await this.commands.reactivateEmployee(employeeId, reason);
        this.notify("employees", "employee_notifications");
    }

    async removeEmployee(
        employeeId: string,
        reason?: string,
    ): Promise<void> {
        await this.commands.removeEmployee(employeeId, reason);
        this.notify(
            "employees",
            "employee_compensation",
            "employee_notifications",
        );
    }

    async changeEmployeeRole(
        employeeId: string,
        role: EmployeeRole,
    ): Promise<void> {

    }

    async changeEmployeeBranch(
        employeeId: string,
        branchId: string | null,
    ): Promise<void> {
    
    }

    // =========================================================
    // COMPENSATION
    // =========================================================

    async setEmployeeCompensation(
        input: SetEmployeeCompensationInput,
    ): Promise<void> {
        const monetaryValues = [
            input.baseSalary,
            input.housingAllowance,
            input.transportAllowance,
            input.mealAllowance,
            input.otherAllowance,
            input.employerPension,
            input.employerTax,
            input.otherEmployerCost,
            input.commissionRate,
        ];

        if (!input.employeeId.trim()) {
            throw new Error("Employee ID is required.");
        }

        if (!input.currency.trim()) {
            throw new Error("Compensation currency is required.");
        }

        if (monetaryValues.some(value => !Number.isFinite(value) || value < 0)) {
            throw new Error("Compensation values must be finite and non-negative.");
        }

        if (
            input.effectiveTo !== null &&
            input.effectiveTo < input.effectiveFrom
        ) {
            throw new Error("Effective end date cannot precede start date.");
        }

    
    }

    async getEmployeeCompensation(employeeId: string) {

    }

    async getEmployeeCompensationHistory(employeeId: string) {
    
    }

    async getBranchEmploymentCosts(
        branchId: string,
        from: number,
        to: number,
    ) {
        if (to < from) {
            throw new Error("The end date must not precede the start date.");
        }

    }

    // =========================================================
    // EMPLOYEE REQUESTS
    // =========================================================

    async submitEmployeeRequest(
        input: SubmitEmployeeRequestInput,
    ): Promise<EmployeeRequest> {
       
     
    }

    async listEmployeeRequests(
        filters?: EmployeeRequestFilters,
    ): Promise<EmployeeRequest[]> {
        
    }

    async getEmployeeRequest(
        requestId: string,
    ): Promise<EmployeeRequest | null> {

    }

    async assignEmployeeRequest(
        requestId: string,
        employeeId: string,
    ): Promise<void> {

    }

    async approveEmployeeRequest(
        input: ResolveEmployeeRequestInput,
    ): Promise<void> {
    }

    async rejectEmployeeRequest(
        input: ResolveEmployeeRequestInput,
    ): Promise<void> {
        
    }

    async cancelEmployeeRequest(requestId: string): Promise<void> {
        await this.commands.cancelEmployeeRequest(requestId);
        this.notify("employee_requests", "employee_notifications");
    }

    // =========================================================
    // NOTIFICATIONS AND ACTIVITY
    // =========================================================

    async listEmployeeNotifications(employeeId: string) {
        return this.queries.listEmployeeNotifications(employeeId);
    }

    async markNotificationRead(notificationId: string): Promise<void> {
        await this.commands.markNotificationRead(notificationId);
        this.notify("employee_notifications");
    }

    async getEmployeeActivity(employeeId: string, limit = 50) {
        if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
            throw new Error("Activity limit must be between 1 and 200.");
        }

        return this.queries.getEmployeeActivity(employeeId, limit);
    }

    // =========================================================
    // AUTHORIZED BUSINESS BOOTSTRAP
    // =========================================================

    async bootstrapEmployeeBusiness(
        businessId: string,
        branchId: string | null,
    ): Promise<unknown> {
        const response = await apiFetch(
            "/sync/bootstrap",
            {
                method: "POST",
                body: JSON.stringify({ businessId, branchId }),
            },
        );

        return response.json();
    }
}


import { apiFetch } from "../../../../../lib/api";
import { BusinessManager } from "../../../../Composer/BusinessManager";

import {
    type Employee,
    type EmployeeRole,
    type EmploymentStatus,
    type EmployeeRequestPriority,
    EmployeeEventType,
    type EmployeeInvitedPayload,
} from "@business/shared-types";
import type {InviteEmployeeRequest } from "./EmployeeRequests";
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

    constructor(
        manager: BusinessManager,
    ) {
        this.manager = manager
    }

    // =========================================================
    // INVITATIONS
    // =========================================================

    /**
     * The command factory must persist the employee-invited event and
     * outbox record atomically. Backend delivery is tracked separately.
     */
    async inviteEmployee(input: InviteEmployeeRequest): Promise<void> {
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
        const app = this.manager.current();
        
        const employeeId = crypto.randomUUID();
        const invitationId = crypto.randomUUID();

        const employeeIntent: CommandIntent<EmployeeInvitedPayload> = {
        // The employee aggregate ID must match the employee record ID.
        aggregateId: employeeId,
        aggregateType: AggregateType.EMPLOYEE,
        type: EmployeeEventType.EMPLOYEE_INVITED,

        payload: {
            invitationId,
            employeeId,

            phone,
            fullName,
            email,
            role: input.role,
            branchId: input.branchId,
            employeeNumber: input.employeeNumber ?? null,

            // This should be a real employee ID, not an employee number.
            reportsToEmployeeId: null,

            userId: null,

            // Keep this metadata consistent with the invitation lifecycle.
            // The backend issuance service should enforce its own expiry.
            expiresAt: Date.now() + 72 * 60 * 60 * 1000,
        },

        mode: "LIVE",
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

        console.log(response)
    }

    async findBusinessEmployees(businessId: string): Promise<Employee[] |null>{
        const app =  this.manager.current();
        return await app?.storage.repositories.employee.findByBusiness(businessId) ?? null
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

import type {
    EmployeeRequest,
} from "@business/shared-types";

import type { EmployeeStatements } from "../../statements/employees/employeesStatements"; 

export class SQLiteEmployeeRequestRepository {
    private readonly statements: EmployeeStatements
    constructor(
        statements: EmployeeStatements,
    ) {
        this.statements = statements
    }

    async findById(
        id: string,
    ): Promise<EmployeeRequest | null> {
        const result =
            await this.statements.findRequestById.query<EmployeeRequest>([
                id,
            ]);

        return result[0] ?? null;
    }

    async findByBusiness(
        businessId: string,
    ): Promise<EmployeeRequest[]> {
        const result =
            await this.statements.findRequestsByBusiness.query<EmployeeRequest>([
                businessId,
            ]);

        return (result ?? []) as EmployeeRequest[];
    }

    async findByBranch(
        businessId: string,
        branchId: string,
    ): Promise<EmployeeRequest[]> {
        const result =
            await this.statements.findRequestsByBranch.query<EmployeeRequest>([
                businessId,
                branchId,
            ]);

        return (result ?? []) as EmployeeRequest[];
    }

    async findByAssignee(
        employeeId: string,
    ): Promise<EmployeeRequest[]> {
        const result =
            await this.statements.findRequestsByAssignee.query<EmployeeRequest>([
                employeeId,
            ]);

        return (result ?? []) as EmployeeRequest[];
    }

    async findByStatus(
        businessId: string,
        status: string,
    ): Promise<EmployeeRequest[]> {
        const result =
            await this.statements.findRequestsByStatus.query<EmployeeRequest>([
                businessId,
                status,
            ]);

        return (result ?? []) as EmployeeRequest[];
    }
}
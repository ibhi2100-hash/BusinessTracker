import type { Employee } from "@business/shared-types";

import type { EmployeeStatements } from "../../statements/employees/employeesStatements"; 

export class SQLiteEmployeeRepository {
    private readonly statements: EmployeeStatements
    constructor(
         statements: EmployeeStatements,
    ) {
        this.statements = statements
    }
    async insertEmployee(employee: Employee){
            await this.statements.insert.execute(
                EmployeeMapper.toInsert(employee)
            );
            const employees = await this.statements.findById.query([
                employee.id
            ])
    }

    async findById(id: string): Promise<Employee | null> {
        const result = await this.statements.findById.query<Employee>([id]);

        return result[0]  ??  null;
    }

    async findByBusiness(
        businessId: string,
    ): Promise<Employee[]> {
        const result =
            await this.statements.findByBusiness.query<Employee>([
                businessId,
            ]);

        return (result ?? []) as Employee[];
    }

    async findByBranch(
        businessId: string,
        branchId: string,
    ): Promise<Employee[]> {
        const result =
            await this.statements.findByBranch.query<Employee>([
                businessId,
                branchId,
            ]);

        return (result?? []) as Employee[];
    }

    async findByUser(
        userId: string,
    ): Promise<Employee | null> {
        const result =
            await this.statements.findByUser.query<Employee>([
                userId,
            ]);

        return result[0]  ?? null;
    }

    async findReports(
        employeeId: string,
    ): Promise<Employee[]> {
        const result =
            await this.statements.findReports.query<Employee>([
                employeeId,
            ]);

        return (result ?? []) as Employee[];
    }
}

class EmployeeMapper {
    static toInsert(
        employee: Employee
    ): unknown[]{
        return [
            employee.id,
            employee.businessId,
            employee.branchId,
            employee.userId,
            employee.reportsToEmployeeId,
            employee.employeeNumber,
            employee.fullName,
            employee.phone,
            employee.email,
            employee.role,
            employee.employmentStatus,
            employee.joinedAt,
            employee.createdAt,
            employee.updatedAt,
            employee.version
        ]
    }
}
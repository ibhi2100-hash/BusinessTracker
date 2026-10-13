import type {
    EmployeeCompensation,
} from "@business/shared-types";

import type { EmployeeStatements } from "../../statements/employees/employeesStatements"; 

export class SQLiteEmployeeCompensationRepository {
    private readonly statements: EmployeeStatements;

    constructor(
        statements: EmployeeStatements,
    ) {
        this.statements = statements
    }

    async findCurrent(
        employeeId: string,
    ): Promise<EmployeeCompensation | null> {
        const result =
            await this.statements.findCompensationByEmployee.query<EmployeeCompensation>([
                employeeId,
            ]);

        return  result[0] ?? null;
    }

    async findHistory(
        employeeId: string,
    ): Promise<EmployeeCompensation[]> {
        const result =
            await this.statements.findCompensationHistory.query<EmployeeCompensation>([
                employeeId,
            ]);

        return (result ?? []) as EmployeeCompensation[];
    }
}
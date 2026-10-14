import type {
    EmployeeInvitation,
} from "@business/shared-types";

import type { EmployeeStatements } from "../../statements/employees/employeesStatements";
export class SQLiteEmployeeInvitationRepository {
    private readonly statements: EmployeeStatements
    constructor(
        statements: EmployeeStatements,
    ) {
        this.statements = statements
    }
    async insertInvitation(employeeInvitation: EmployeeInvitation){
        await this.statements.insertInvitation.execute(
            EmployeeInvitationMapper.toInsert(employeeInvitation)
        )
    }
    async findById(
        id: string,
    ): Promise<EmployeeInvitation | null> {
        const result =
            await this.statements.findInvitationById.query<EmployeeInvitation>([
                id,
            ]);

        return result[0]?? null;
    }

    async findByEmployee(
        employeeId: string,
    ): Promise<EmployeeInvitation[]> {
        const result =
            await this.statements.findInvitationsByEmployee.query<EmployeeInvitation>([
                employeeId,
            ]);

        return (result ?? []) as EmployeeInvitation[];
    }

    async findByBusiness(
        businessId: string,
    ): Promise<EmployeeInvitation[]> {
        const result =
            await this.statements.findInvitationsByBusiness.query([
                businessId,
            ]);

        return (result ?? []) as EmployeeInvitation[];
    }
}

class EmployeeInvitationMapper {
    static toInsert(
        invitation: EmployeeInvitation
    ): unknown[]{

        return [
            invitation.id,
            invitation.businessId,
            invitation.employeeId,
            invitation.branchId,
            invitation.email,
            invitation.phone,
            invitation.role,
            invitation.status,
            invitation.expiresAt,
            invitation.createdAt,
            invitation.acceptedAt,
            invitation.revokedAt,
            invitation.updatedAt,
            invitation.version
        ]
    }
}
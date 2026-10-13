import type {
    DomainEvent,
    EmployeeInvitedPayload,
    EmployeeActivatedPayload,
    EmployeeRoleChangedPayload,
    EmployeeBranchChangedPayload,
} from "@business/shared-types";

import {
    EmployeeEventType,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { employeeKeys } from "../../statements/employees/employeeKeys"; 


type EmployeeLifecycleEvent =
    | DomainEvent<EmployeeInvitedPayload>
    | DomainEvent<EmployeeActivatedPayload>
    | DomainEvent<EmployeeRoleChangedPayload>
    | DomainEvent<EmployeeBranchChangedPayload>;


export class EmployeeConsumer {

    buildOperations(
        events: readonly EmployeeLifecycleEvent[],
    ): SQLiteStatementOperation[] {

        const operations: SQLiteStatementOperation[] = [];

        for (const event of events) {

            switch (event.type) {

                case EmployeeEventType.EMPLOYEE_INVITED: {

                    const payload = event.payload;

                    operations.push({
                        statementKey: employeeKeys.insert,
                        params: [
                            event.aggregateId,
                            event.businessId,

                            payload.branchId,

                            null,
                            null,

                            payload.employeeNumber,

                            payload.fullName,

                            payload.phone,
                            payload.email,

                            payload.role,

                            "INVITED",

                            null,

                            event.createdAt,
                            event.createdAt,

                            event.expectedAggregateVersion,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_ACTIVATED: {

                    const payload = event.payload;

                    operations.push({
                        statementKey:
                            employeeKeys.updateStatus,
                        params: [
                            "ACTIVE",
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    operations.push({
                        statementKey:
                            employeeKeys.updateUser,
                        params: [
                            payload.userId,
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    operations.push({
                        statementKey:
                            employeeKeys.updateJoined,
                        params: [
                            payload.joinedAt,
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_SUSPENDED: {

                    operations.push({
                        statementKey:
                            employeeKeys.updateStatus,
                        params: [
                            "SUSPENDED",
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REACTIVATED: {

                    operations.push({
                        statementKey:
                            employeeKeys.updateStatus,
                        params: [
                            "ACTIVE",
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REMOVED: {

                    operations.push({
                        statementKey:
                            employeeKeys.updateStatus,
                        params: [
                            "REMOVED",
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_ROLE_CHANGED: {

                    operations.push({
                        statementKey:
                            employeeKeys.updateRole,
                        params: [
                            event.payload.role,
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_BRANCH_CHANGED: {

                    operations.push({
                        statementKey:
                            employeeKeys.updateBranch,
                        params: [
                            event.payload.branchId,
                            event.createdAt,
                            event.expectedAggregateVersion,
                            event.aggregateId,
                        ],
                    });

                    break;
                }
            }
        }

        return operations;
    }
}
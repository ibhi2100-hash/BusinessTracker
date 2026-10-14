import type {
    DomainEvent,
    EmployeeInvitedPayload,
    EmployeePayload,
} from "@business/shared-types";


import {
    EmployeeEventType,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { employeeKeys } from "../../statements/employees/employeeKeys"; 
import type { ProjectionConsumer } from "@business/event-bus";
import type { SQLiteEmployeeRepository } from "../../repositories/EmployeeRepositories/SQLiteEmployeeRepository";
import { EmployeeReducer } from "@business/projection-families";
import { changeNotifier } from "../changeNoifier";


type EmployeeLifecycleEvent =
    | DomainEvent<EmployeeInvitedPayload>


export class EmployeeConsumer
implements ProjectionConsumer<DomainEvent<EmployeePayload>> {
    readonly name = "Employee";
    private readonly repository: SQLiteEmployeeRepository;
    constructor(
        repository: SQLiteEmployeeRepository
    ){
        this.repository = repository
    }

    async handle(events: readonly DomainEvent<EmployeePayload>[]): Promise<void> {
            for (const event of events) {
            switch (event.type) {
                case EmployeeEventType.EMPLOYEE_INVITED: {
                    const employee = 
                        new EmployeeReducer().reduce(null, event);
                        if(!employee){
                            return
                        }
                        await this.repository.insertEmployee(employee);

                        const savedEmployee = await this.repository.findByBusiness(event.businessId);
                        console.log("This is the saved Employees: ", savedEmployee)
                        changeNotifier.notify(["employees"])
                }
            }
        }
    }
    
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
                            event.createdAt,
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
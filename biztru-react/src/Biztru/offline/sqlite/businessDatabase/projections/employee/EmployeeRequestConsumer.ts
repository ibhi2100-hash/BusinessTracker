import type {
    DomainEvent,
} from "@business/shared-types";

import {
    EmployeeEventType,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { employeeKeys } from "../../statements/employees/employeeKeys";


export class EmployeeRequestConsumer {

    buildOperations(
        events: readonly DomainEvent<unknown>[],
    ): SQLiteStatementOperation[] {

        const operations: SQLiteStatementOperation[] = [];

        for (const event of events) {

            switch (event.type) {

                case EmployeeEventType.EMPLOYEE_REQUEST_SUBMITTED: {

                    const payload =
                        event.payload as any

                    operations.push({
                        statementKey:
                            employeeKeys.insertRequest,

                        params: [
                            event.aggregateId,

                            event.businessId,

                            payload.branchId,

                            payload.requesterEmployeeId,

                            payload.assignedToEmployeeId,

                            payload.type,

                            payload.title,

                            payload.description,

                            "PENDING",

                            payload.priority,

                            payload.amount,

                            payload.currency,

                            event.createdAt,

                            null,
                            null,

                            event.createdAt,

                            event.createdAt,

                            event.expectedAggregateVersion,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REQUEST_ASSIGNED: {

                    const payload =
                        event.payload as any

                    operations.push({
                        statementKey:
                            employeeKeys.updateRequestAssignment,

                        params: [
                            payload.employeeId,

                            event.createdAt,

                            event.expectedAggregateVersion,

                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REQUEST_APPROVED: {

                    const payload =
                        event.payload as any

                    operations.push({
                        statementKey:
                            employeeKeys.updateRequestResolution,

                        params: [
                            "APPROVED",

                            event.createdAt,

                            payload.note,

                            event.createdAt,

                            event.expectedAggregateVersion,

                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REQUEST_REJECTED: {

                    const payload =
                        event.payload as any

                    operations.push({
                        statementKey:
                            employeeKeys.updateRequestResolution,

                        params: [
                            "REJECTED",

                            event.createdAt,

                            payload.note,

                            event.createdAt,

                            event.expectedAggregateVersion,

                            event.aggregateId,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_REQUEST_CANCELLED: {

                    const payload =
                        event.payload as any

                    operations.push({
                        statementKey:
                            employeeKeys.updateRequestResolution,

                        params: [
                            "CANCELLED",

                            event.createdAt,

                            payload.note,

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
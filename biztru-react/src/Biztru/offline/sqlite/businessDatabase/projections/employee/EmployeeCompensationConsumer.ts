import type {
    DomainEvent,
    EmployeeCompensationPayload,
} from "@business/shared-types";

import {
    EmployeeEventType,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { employeeKeys } from "../../statements/employees/employeeKeys";


export class EmployeeCompensationConsumer {

    buildOperations(
        events: readonly DomainEvent<EmployeeCompensationPayload>[],
    ): SQLiteStatementOperation[] {

        const operations: SQLiteStatementOperation[] = [];

        for (const event of events) {

            switch (event.type) {

                case EmployeeEventType.EMPLOYEE_COMPENSATION_SET:
                case EmployeeEventType.EMPLOYEE_COMPENSATION_CHANGED: {

                    const payload = event.payload;

                    const compensationId =
                        event.id;

                    operations.push({
                        statementKey:
                            employeeKeys.upsertCompensation,

                        params: [
                            compensationId,

                            event.businessId,

                            payload.employeeId,

                            payload.branchId,

                            payload.currency,

                            payload.payFrequency,

                            payload.baseSalary,

                            payload.housingAllowance,

                            payload.transportAllowance,

                            payload.mealAllowance,

                            payload.otherAllowance,

                            payload.employerPension,

                            payload.employerTax,

                            payload.otherEmployerCost,

                            payload.commissionRate,

                            payload.effectiveFrom,

                            payload.effectiveTo,

                            event.createdAt,
                            event.createdAt,

                            event.expectedAggregateVersion,
                        ],
                    });


                    operations.push({
                        statementKey:
                            employeeKeys.insertCompensationHistory,

                        params: [
                            compensationId,

                            event.businessId,

                            payload.employeeId,

                            payload.branchId,

                            payload.currency,

                            payload.payFrequency,

                            payload.baseSalary,

                            payload.housingAllowance,

                            payload.transportAllowance,

                            payload.mealAllowance,

                            payload.otherAllowance,

                            payload.employerPension,

                            payload.employerTax,

                            payload.otherEmployerCost,

                            payload.commissionRate,

                            payload.effectiveFrom,

                            payload.effectiveTo,

                            event.createdAt,

                            event.expectedAggregateVersion,
                        ],
                    });

                    break;
                }
            }
        }

        return operations;
    }
}
import type {
    DomainEvent,
    EmployeeInvitedPayload,
} from "@business/shared-types";

import {
    EmployeeEventType,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
import { employeeKeys } from "../../statements/employees/employeeKeys"; 


export class EmployeeInvitationConsumer {

    buildOperations(
        events: readonly DomainEvent<unknown>[],
    ): SQLiteStatementOperation[] {

        const operations: SQLiteStatementOperation[] = [];

        for (const event of events) {

            switch (event.type) {

                case EmployeeEventType.EMPLOYEE_INVITED: {

                    const payload =
                        event.payload as EmployeeInvitedPayload;

                    /*
                     * Invitation ID should normally be its own
                     * aggregate/identifier.
                     *
                     * If your event metadata contains a separate
                     * invitationId, use that here.
                     *
                     * For the current contract, aggregateId is
                     * the employee aggregate, so this should be
                     * replaced once the invitation event carries
                     * invitationId.
                     */
                    const invitationId =
                        event.id;

                    operations.push({
                        statementKey:
                            employeeKeys.insertInvitation,

                        params: [
                            invitationId,

                            event.businessId,

                            event.aggregateId,

                            payload.branchId,

                            payload.email,
                            payload.phone,

                            payload.role,

                            "PENDING",

                            null,

                            event.createdAt,

                            null,
                            null,

                            event.createdAt,

                            event.expectedAggregateVersion,
                        ],
                    });

                    break;
                }


                case EmployeeEventType.EMPLOYEE_INVITATION_ACCEPTED: {

                    /*
                     * Invitation aggregate ID should be used here.
                     *
                     * Do not confuse this with employeeId once
                     * invitationId becomes an explicit field.
                     */

                    operations.push({
                        statementKey:
                            employeeKeys.acceptInvitation,

                        params: [
                            event.createdAt,
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
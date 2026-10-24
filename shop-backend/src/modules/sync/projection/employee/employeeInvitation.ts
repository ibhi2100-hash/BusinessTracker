
import { EventConsumer } from "@business/event-bus";
import { EmployeeInvitationReducer } from "@business/projection-families";
import {
  DomainEvent,
  EmployeeInvitationPayload,
  EmployeeEventType,
} from "@business/shared-types";

import { EmployeeInvitationIssuanceService } from "../../../employeeInvitations/service/EmployeeInvitationIssuanceService.js";

export class EmployeeInvitationConsumer
  implements EventConsumer<DomainEvent<EmployeeInvitationPayload>>
{
  readonly name = "Employee Invitation";

  private readonly reducer: EmployeeInvitationReducer;
  private readonly issuanceService: EmployeeInvitationIssuanceService;

  constructor(
    issuanceService: EmployeeInvitationIssuanceService,
  ) {
    this.reducer = new EmployeeInvitationReducer();
    this.issuanceService = issuanceService;
  }

  async handle(
    events: readonly DomainEvent<EmployeeInvitationPayload>[],
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case EmployeeEventType.EMPLOYEE_INVITED: {
          const invitation = this.reducer.reduce(null, event);

          if (!invitation) {
            throw new Error(
              "Unable to reduce EMPLOYEE_INVITED event into an invitation",
            );
          }

          // The service generates credentials and creates the delivery job.
          // It must be idempotent for retries using invitation.id.
          await this.issuanceService.issue({
            invitationId: invitation.id,
            employeeId: invitation.employeeId,
            businessId: invitation.businessId,
            branchId: invitation.branchId,
            email: invitation.email ?? "",
            role: invitation.role
          });

          break;
        }

        default:
          break;
      }
    }
  }
}

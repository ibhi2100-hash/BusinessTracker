
import { EventConsumer } from "@business/event-bus";
import { EmployeeReducer } from "@business/projection-families";
import {
  DomainEvent,
  EmployeePayload,
  EmployeeEventType,
} from "@business/shared-types";


import { EmployeeRepository } from "../../../employeeInvitations/repository/employee/EmployeesRepository.js";

export class EmployeeConsumer
  implements EventConsumer<DomainEvent<EmployeePayload>>
{
  readonly name = "Employee Invitation";

  private readonly reducer: EmployeeReducer;
  private readonly repository: EmployeeRepository;

  constructor(
    repository: EmployeeRepository,
  ) {
    this.reducer = new EmployeeReducer();
    this.repository = repository
  }

  async handle(
    events: readonly DomainEvent<EmployeePayload>[],
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case EmployeeEventType.EMPLOYEE_INVITED: {

          const employee = this.reducer.reduce(null, event);

          if (!employee) {
            throw new Error(
              "Unable to reduce EMPLOYEE_INVITED event into an invitation",
            );
          } 

          // The service generates credentials and creates the delivery job.
          // It must be idempotent for retries using invitation.id.
          await this.repository.upsert(employee)
          break;
        }

        default:
          break;
      }
    }
  }
}

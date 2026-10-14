import { EventConsumer } from "@business/event-bus";
import { EmployeeInvitationReducer } from "@business/projection-families";
import { DomainEvent, EmployeeInvitationPayload, EmployeeEventType } from "@business/shared-types";
import { EmployeeInvitationRepository } from "../repositories/employee/EmployeeInvitationRepository.js";

export class EmployeeInvitationConsumer 
implements EventConsumer<DomainEvent<EmployeeInvitationPayload>>{

    readonly name = "Employee Invitation";
    private readonly repository: EmployeeInvitationRepository;
    constructor(
        repository: EmployeeInvitationRepository
    ){
        this.repository = repository
    }

    async handle(events: readonly DomainEvent<EmployeeInvitationPayload>[]): Promise<void> {
         for (const event of events) {
            switch (event.type) {
                case EmployeeEventType.EMPLOYEE_INVITED: {
                    const invitation = 
                        new EmployeeInvitationReducer().reduce(null, event);

                    await this.repository.upsert(invitation!)

                    break;
                }
            }
        }
    }
}
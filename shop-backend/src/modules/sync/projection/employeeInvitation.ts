import { EventConsumer } from "@business/event-bus";
import { EmployeeInvitationReducer } from "@business/projection-families";
import { DomainEvent, EmployeeInvitationPayload, EmployeeEventType } from "@business/shared-types";
import { EmployeeInvitationRepository } from "../../employeeInvitations/repository/EmployeeInvitationRepository.js";
import { createHash, randomBytes } from "node:crypto";

const rawToken = randomBytes(32).toString("base64url");

const tokenHash = createHash("sha256")
  .update(rawToken)
  .digest("hex");

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
                    console.log("This is the Invitation that is going to be saved: ", invitation)
                    await this.repository.upsert(invitation!)
                    break;
                }
            }
        }
    }
}
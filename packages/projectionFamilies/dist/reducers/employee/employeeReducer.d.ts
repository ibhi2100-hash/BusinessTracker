import type { DomainEvent, EmployeeCompensation, EmployeeCompensationPayload, EmployeeInvitationPayload, EmployeePayload, EmployeeRequest, EmployeeRequestPayload, EmployeeCompensationHistory } from "@business/shared-types";
import { type Employee, type EmployeeInvitation } from "@business/shared-types";
export declare class EmployeeReducer {
    reduce(current: Employee | null, event: DomainEvent<EmployeePayload>): Employee | null;
}
export declare class EmployeeCompensationReducer {
    reduce(current: EmployeeCompensation | null, event: DomainEvent<EmployeeCompensationPayload>): EmployeeCompensation | null;
}
export declare class EmployeeRequestReducer {
    reduce(current: EmployeeRequest | null, event: DomainEvent<EmployeeRequestPayload>): EmployeeRequest | null;
}
export declare class EmployeeInvitationReducer {
    reduce(current: EmployeeInvitation | null, event: DomainEvent<EmployeeInvitationPayload>): EmployeeInvitation | null;
}
export declare class EmployeeCompensationHistoryReducer {
    reduce(event: DomainEvent<EmployeeCompensationPayload>): EmployeeCompensationHistory | null;
}

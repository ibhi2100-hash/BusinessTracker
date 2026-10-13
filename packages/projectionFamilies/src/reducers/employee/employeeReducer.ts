import type {
     DomainEvent, 
     EmployeeCompensation, 
     EmployeeCompensationPayload, 
     EmployeeInvitationPayload, 
     EmployeePayload, 
     EmployeeRequest, 
     EmployeeRequestPayload,
     EmployeeCompensationHistory
} from "@business/shared-types";
import {
    EmployeeEventType,
    type Employee,
    type EmployeeInvitation,
} from "@business/shared-types";

export class EmployeeReducer {

    reduce(
        current: Employee | null,
        event: DomainEvent<EmployeePayload>
    ): Employee | null {

        switch (event.type) {

            case EmployeeEventType.EMPLOYEE_INVITED: {

                return {
                    id: event.aggregateId,

                    businessId:
                        event.businessId,

                    branchId:
                        event.payload.branchId ?? null,

                    userId:
                        null,

                    employeeNumber:
                        event.payload.employeeNumber ??
                        null,

                    reportsToEmployeeId: 
                        event.payload.reportsToEmployeeId ??
                        null,

                    fullName:
                        event.payload.fullName,

                    phone:
                        event.payload.phone ??
                        null,

                    email:
                        event.payload.email ??
                        null,

                    role:
                        event.payload.role,

                    employmentStatus:
                        "INVITED",

                    joinedAt:
                        null,

                    createdAt:
                        event.createdAt,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_ACTIVATED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    employmentStatus:
                        "ACTIVE",

                    userId:
                        event.payload.userId ??
                        current.userId,

                    joinedAt:
                        event.createdAt,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_SUSPENDED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    employmentStatus:
                        "SUSPENDED",

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_REACTIVATED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    employmentStatus:
                        "ACTIVE",

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_REMOVED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    employmentStatus:
                        "REMOVED",

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_ROLE_CHANGED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    role:
                        event.payload.role,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            case EmployeeEventType.EMPLOYEE_BRANCH_CHANGED: {

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    branchId:
                        event.payload.branchId,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            default:
                return current;
        }
    }
}




export class EmployeeCompensationReducer {

    reduce(
        current: EmployeeCompensation | null,
        event: DomainEvent<EmployeeCompensationPayload>
    ): EmployeeCompensation | null {

        switch (event.type) {

            case EmployeeEventType.EMPLOYEE_COMPENSATION_SET:
            case EmployeeEventType.EMPLOYEE_COMPENSATION_CHANGED: {

                return {
                    id: event.aggregateId,

                    businessId:
                        event.businessId,

                    employeeId:
                        event.payload.employeeId,

                    branchId:
                        event.payload.branchId ??
                        null,

                    currency:
                        event.payload.currency ??
                        "NGN",

                    payFrequency:
                        event.payload.payFrequency ??
                        "MONTHLY",

                    baseSalary:
                        event.payload.baseSalary ?? 0,

                    housingAllowance:
                        event.payload.housingAllowance ?? 0,

                    transportAllowance:
                        event.payload.transportAllowance ?? 0,

                    mealAllowance:
                        event.payload.mealAllowance ?? 0,

                    otherAllowance:
                        event.payload.otherAllowance ?? 0,

                    employerPension:
                        event.payload.employerPension ?? 0,

                    employerTax:
                        event.payload.employerTax ?? 0,

                    otherEmployerCost:
                        event.payload.otherEmployerCost ?? 0,

                    commissionRate:
                        event.payload.commissionRate ?? 0,

                    effectiveFrom:
                        event.payload.effectiveFrom ??
                        event.createdAt,

                    effectiveTo:
                        event.payload.effectiveTo ??
                        null,

                    createdAt:
                        current?.createdAt ??
                        event.createdAt,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };
            }

            default:
                return current;
        }
    }
}


export class EmployeeRequestReducer {

    reduce(
        current: EmployeeRequest | null,
        event: DomainEvent<EmployeeRequestPayload>
    ): EmployeeRequest | null {

        switch (event.type) {

            case EmployeeEventType.EMPLOYEE_REQUEST_SUBMITTED:

                return {
                    id: event.aggregateId,

                    businessId:
                        event.businessId,

                    branchId:
                        event.payload.branchId ??
                        null,

                    requesterEmployeeId:
                        event.payload.requesterEmployeeId,

                    assignedToEmployeeId:
                        event.payload.assignedToEmployeeId ??
                        null,

                    type:
                        event.payload.type,

                    title:
                        event.payload.title,

                    description:
                        event.payload.description ??
                        null,

                    status:
                        "PENDING",

                    priority:
                        event.payload.priority ??
                        "NORMAL",

                    amount:
                        event.payload.amount ??
                        null,

                    currency:
                        event.payload.currency ??
                        null,

                    submittedAt:
                        event.createdAt,

                    resolvedAt:
                        null,

                    resolutionNote:
                        null,

                    createdAt:
                        event.createdAt,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };

            case EmployeeEventType.EMPLOYEE_REQUEST_ASSIGNED:

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    assignedToEmployeeId:
                        event.payload.employeeId,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };

            case EmployeeEventType.EMPLOYEE_REQUEST_APPROVED:

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    status:
                        "APPROVED",

                    resolvedAt:
                        event.createdAt,

                    resolutionNote:
                        event.payload.note ??
                        null,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };

            case EmployeeEventType.EMPLOYEE_REQUEST_REJECTED:

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    status:
                        "REJECTED",

                    resolvedAt:
                        event.createdAt,

                    resolutionNote:
                        event.payload.note ??
                        null,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };

            case EmployeeEventType.EMPLOYEE_REQUEST_CANCELLED:

                if (!current) {
                    return null;
                }

                return {
                    ...current,

                    status:
                        "CANCELLED",

                    resolvedAt:
                        event.createdAt,

                    updatedAt:
                        event.createdAt,

                    version:
                        event.expectedAggregateVersion,
                };

            default:
                return current;
        }
    }
}


export class EmployeeInvitationReducer {
  reduce(
    current: EmployeeInvitation | null,
    event: DomainEvent<EmployeeInvitationPayload>,
  ): EmployeeInvitation | null {
    switch (event.type) {
      case EmployeeEventType.EMPLOYEE_INVITED: {
        const payload = event.payload;

        return {
          id: payload.invitationId,
          businessId: event.businessId,
          employeeId: payload.employeeId,
          branchId: payload.branchId ?? null,
          email: payload.email ?? null,
          phone: payload.phone ?? null,
          role: payload.role,
          status: "PENDING",
          expiresAt: payload.expiresAt ?? null,
          createdAt: event.createdAt,
          acceptedAt: null,
          revokedAt: null,
          updatedAt: event.createdAt,
          version: event.expectedAggregateVersion,
        };
      }

      case EmployeeEventType.EMPLOYEE_INVITATION_ACCEPTED: {
        if (!current) {
          throw new Error(
            `Cannot accept missing invitation: ${event.payload.invitationId}`,
          );
        }

        if (current.status !== "PENDING") {
          return current;
        }

        return {
          ...current,
          status: "ACCEPTED",
          acceptedAt: event.createdAt,
          updatedAt: event.createdAt,
          version: event.expectedAggregateVersion,
        };
      }

      case EmployeeEventType.EMPLOYEE_INVITATION_EXPIRED: {
        if (!current) {
          throw new Error(
            `Cannot expire missing invitation: ${event.payload.invitationId}`,
          );
        }

        if (current.status !== "PENDING") {
          return current;
        }

        return {
          ...current,
          status: "EXPIRED",
          updatedAt: event.createdAt,
          version: event.expectedAggregateVersion,
        };
      }

      case EmployeeEventType.EMPLOYEE_INVITATION_REVOKED: {
        if (!current) {
          throw new Error(
            `Cannot revoke missing invitation: ${event.payload.invitationId}`,
          );
        }

        if (current.status !== "PENDING") {
          return current;
        }

        return {
          ...current,
          status: "REVOKED",
          revokedAt: event.createdAt,
          updatedAt: event.createdAt,
          version: event.expectedAggregateVersion,
        };
      }

      default:
        return current;
    }
  }
}

export class EmployeeCompensationHistoryReducer {
  reduce(
    event: DomainEvent<EmployeeCompensationPayload>,
  ): EmployeeCompensationHistory | null {
    switch (event.type) {
      case EmployeeEventType.EMPLOYEE_COMPENSATION_SET:
      case EmployeeEventType.EMPLOYEE_COMPENSATION_CHANGED: {
        const payload = event.payload;

        return {
          // Use the immutable event ID so each compensation
          // change has its own replay-stable history row.
          id: event.id,
          businessId: event.businessId,
          employeeId: payload.employeeId,
          branchId: payload.branchId ?? null,
          currency: payload.currency ?? "NGN",
          payFrequency: payload.payFrequency ?? "MONTHLY",
          baseSalary: payload.baseSalary ?? 0,
          housingAllowance: payload.housingAllowance ?? 0,
          transportAllowance: payload.transportAllowance ?? 0,
          mealAllowance: payload.mealAllowance ?? 0,
          otherAllowances: payload.otherAllowance ?? 0,
          employerPension: payload.employerPension ?? 0,
          employerTax: payload.employerTax ?? 0,
          otherEmployerCost: payload.otherEmployerCost ?? 0,
          commissionRate: payload.commissionRate ?? 0,
          effectiveFrom: payload.effectiveFrom ?? event.createdAt,
          effectiveTo: payload.effectiveTo ?? null,
          createdAt: event.createdAt,
          updatedAt: event.createdAt,
          version: event.expectedAggregateVersion,
        };
      }

      default:
        return null;
    }
  }
}

// ============================================================
// UserConsumer.ts
// ============================================================

import {
    EventConsumer,
} from "@business/event-bus";

import {
    BusinessEventTypes,
    DomainEvent,
} from "@business/shared-types";

import {
    AuthRepository,
} from "../../auth/repository/auth.repository.js";


export class UserConsumer
    implements EventConsumer<DomainEvent> {


    readonly name =
        "users";


    constructor(
        private readonly repository: AuthRepository
    ) {}


    async handle(
        events: readonly DomainEvent<any>[]
    ): Promise<void> {

        for (
            const event of events
        ) {

            switch (event.type) {


                /*
                 * ==================================================
                 * BUSINESS CREATED
                 * ==================================================
                 *
                 * The event creator becomes associated with
                 * the newly created business.
                 *
                 * event.userId = owner/creator
                 * event.aggregateId = businessId
                 * ==================================================
                 */

                case BusinessEventTypes.BUSINESS_CREATED: {

                    const userId =
                        event.actor.userId;

                    const businessId =
                        event.aggregateId ??
                        event.payload?.businessId;


                    if (
                        !userId ||
                        !businessId
                    ) {

                        break;

                    }


                    await this.repository.assignBusiness(
                        userId,
                        businessId
                    );


                    break;
                }


                /*
                 * ==================================================
                 * BRANCH CREATED
                 * ==================================================
                 *
                 * The user creating the branch becomes associated
                 * with that branch.
                 *
                 * event.userId = creator
                 * event.aggregateId = branchId
                 * ==================================================
                 */

                case BusinessEventTypes.BRANCH_CREATED: {

                    const userId =
                        event.actor.userId;

                    const branchId =
                        event.aggregateId ??
                        event.payload?.branchId;


                    if (
                        !userId ||
                        !branchId
                    ) {

                        break;

                    }


                    await this.repository.assignBranch(
                        userId,
                        branchId
                    );


                    break;
                }


                /*
                 * ==================================================
                 * BUSINESS ACTIVATED
                 * ==================================================
                 */

                case BusinessEventTypes.BUSINESS_ACTIVATION: {

                    const userId =
                        event.actor.userId;


                    if (!userId) {

                        break;

                    }


                    await this.repository.completeOnboarding(
                        userId
                    );


                    break;
                }


                /*
                 * ==================================================
                 * UNKNOWN EVENTS
                 * ==================================================
                 */

                default:
                    break;

            }

        }

    }

}
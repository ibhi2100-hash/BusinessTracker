import { Business, BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BusinessPayload {
  id: string;
  name: string;
  address: string;
}
export class BusinessReducer 
implements ProjectionReducer<Business, DomainEvent>{
  reduce(state: Business | null, event: DomainEvent<BusinessPayload>): Business {
    switch (event.type) {

            case BusinessEventTypes.BUSINESS_CREATED:

                return this.created(event);

            case BusinessEventTypes.BUSINESS_ACTIVATION:

                return this.activate(
                    state,
                    event
                );

            default:

                return state!;

        }

  }

  private created(
    event: DomainEvent<BusinessPayload>
): Business {

    return {

        id:
            event.aggregateId,

        name:
            event.payload.name,

        address:
            event.payload.address,

        userId:
            event.actor.userId,

        status:
            "ONBOARDING",

        isOnboarding:
            true,

        onboardingCompleted:
            false,

        createdAt:
            event.metadata.occuredAt

    };

}

private activate(

    current: Business | null,

    event: DomainEvent

): Business {

    if (!current) {

        throw new Error(

            "Business projection not found."

        );

    }

    return {

        ...current,

        activatedAt:
            event.metadata.occuredAt,

        status:
            "ACTIVE",

        isOnboarding:
            false,

        onboardingCompleted:
            true

    };

  }
}
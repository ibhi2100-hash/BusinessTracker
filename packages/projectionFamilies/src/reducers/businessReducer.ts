import { Business, BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BusinessPayload {
  id: string;
  name: string;
  address: string;
}
export class BusinessReducer 
implements ProjectionReducer<DomainEvent>{
  reduce(event: DomainEvent<BusinessPayload>) {
    switch (event.type) {

            case BusinessEventTypes.BUSINESS_CREATED:

                return this.created(event);

            case BusinessEventTypes.BUSINESS_ACTIVATION:

                return this.activate(
                    event
                );

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
            event.createdAt

    };

}

private activate(

    event: DomainEvent

) {


    
    return {

        activatedAt:
            event.createdAt,

        status:
            "ACTIVE",

        isOnboarding:
            false,

        onboardingCompleted:
            true

    };

  }
}
import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { BaseEvent } from "../types";

export const BusinessReducer = {

  reduce(
    current: any,
    event: BaseEvent
  ) {

    switch (event.type) {

      case BusinessEventTypes.BUSINESS_CREATED:

        return {

          id:
            event.payload.id,

          name:
            event.payload.name,

          address:
            event.payload.address,

          userId:
            event.userId,

          isOnboarding: true,

          onboardingCompleted: false,

          status: "ONBOARDING",

          createdAt:
            event.createdAt,
        };

      case BusinessEventTypes.BUSINESS_ACTIVATION:

        if (!current) {
          return current;
        }

        return {

          ...current,

          activatedAt:
            event.createdAt,

          isOnboarding: false,

          onboardingCompleted: true,

          status: "ACTIVE",
        };

      default:
        return current;
    }
  }
};
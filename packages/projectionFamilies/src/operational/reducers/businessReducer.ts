import { BusinessEventTypes } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";

export const BusinessReducer = {
    initialState: () => ({
    id: "",
    name: "",
    userId: "",
    address: "",

  }),
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
        console.log("Business Activation Reducer is Hit : ", current)
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
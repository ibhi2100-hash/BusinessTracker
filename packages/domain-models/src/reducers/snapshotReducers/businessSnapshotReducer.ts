import { BaseEvent } from "@business/shared-types";

export const BusinessSnapshotReducer = {

  aggregateType: "BUSINESS",

  initialState() {
    return null;
  },

  reduce(current: any, event: BaseEvent) {

    switch(event.type) {

      case "BUSINESS_CREATED":

        return {

          id:
            event.aggregateId,

          name:
            event.payload.name,

          address:
            event.payload.address,

          onboardingCompleted:
            false,

          status:
            "ONBOARDING"
        };

      case "BUSINESS_ACTIVATION":

        if (!current) {
          return current;
        }

        return {

          ...current,

          onboardingCompleted:
            true,

          status:
            "ACTIVE"
        };

      default:
        return current;
    }
  }
};
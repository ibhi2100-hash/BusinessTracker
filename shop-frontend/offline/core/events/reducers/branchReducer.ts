import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { BaseEvent } from "../types";

export const BranchReducer = {

  reduce(
    current: any,
    event: BaseEvent
  ) {

    switch (event.type) {

      case BusinessEventTypes.BRANCH_CREATED:

        return {

            id:
                event.payload.id,

            name:
                event.payload.name,

            Phone:
                event.payload.phone,

            businessId: event.businessId,
            
            isActive: true,
            
            isDefault: true,

            createdAt:
                event.createdAt,
        };

      default:
        return current;
    }
  }
};
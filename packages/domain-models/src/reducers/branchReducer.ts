import { BusinessEventTypes } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";

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

            phone:
                event.payload.phone,

            businessId: event.businessId,
            
            isActive: true,
            
            isDefault: false,

            createdAt:
                event.createdAt,
        };

      default:
        return current ?? null;
    }
  }
};
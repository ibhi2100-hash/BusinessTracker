import { BusinessEventTypes } from "@business/shared-types";
import { IntegrationEvent } from "@business/shared-types";

export const BranchReducer = {
  initialState: () => ({
    id: "",
    name: "",
    address: "",
    phone: ""

  }),

  reduce(
    current: any,
    event: IntegrationEvent
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
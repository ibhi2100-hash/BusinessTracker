import { BusinessEventTypes } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";

export const BranchReducer = {
  initialState: () => ({
    id: "",
    name: "",
    address: "",
    phone: ""

  }),

  reduce(
    current: any,
    event: BaseEvent
  ) {
    console.log("This is the event that hit the branch Reducer: ", event.payload)

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
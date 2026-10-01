import { BusinessEventTypes } from "@business/shared-types";
export class BranchReducer {
    reduce(state, event) {
        switch (event.type) {
            case BusinessEventTypes.BRANCH_CREATED:
                return {
                    id: event.payload.id,
                    name: event.payload.name,
                    address: event.payload.address ?? null,
                    phone: event.payload.phone ?? null,
                    businessId: event.businessId,
                    isActive: true,
                    isDefault: true,
                    createdAt: event.createdAt,
                };
            default:
                return state;
        }
    }
}

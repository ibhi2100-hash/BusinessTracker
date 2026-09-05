import { Branch, BusinessEventTypes } from "@business/shared-types";
import { DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BranchPayload {
  id: string;
  name: string;
  address: string;
  phone: string;
}
export class BranchReducer 
implements ProjectionReducer<Branch, DomainEvent<BranchPayload>> {
  reduce(state: Branch | null , event: DomainEvent<BranchPayload>): Branch | null {
    switch (event.type) {
      

      case BusinessEventTypes.BRANCH_CREATED:

        return {

            id:
                event.payload.id,

            name:
                event.payload.name,

            address: event.payload.address ?? null,

            phone:
                event.payload.phone ?? null,

            businessId: event.businessId!,
            
            isActive: true,
            
            isDefault: true,

            createdAt:
                event.createdAt,
        };

      default:
        return state;
    }
  }
}
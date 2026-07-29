import { DomainEvent } from "@business/shared-types";
import { ProjectionHandler } from "../../contracts/ProjectionHandler";
import { BusinessEventTypes } from "@business/shared-types";
import { BusinessReducer } from "../../reducers/businessReducer";

export const BusinessProjectionHandler: ProjectionHandler<DomainEvent> = {

    projection: "business",

    supports(event){

        return event.type ===
            BusinessEventTypes.BUSINESS_CREATED;

    },

    projectionId(event){

        return event.aggregateId;

    },

    reducer:
        new BusinessReducer()

}
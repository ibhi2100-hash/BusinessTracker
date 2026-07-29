"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessProjectionHandler = void 0;
const shared_types_1 = require("@business/shared-types");
const businessReducer_1 = require("../../reducers/businessReducer");
exports.BusinessProjectionHandler = {
    projection: "business",
    supports(event) {
        return event.type ===
            shared_types_1.BusinessEventTypes.BUSINESS_CREATED;
    },
    projectionId(event) {
        return event.aggregateId;
    },
    reducer: new businessReducer_1.BusinessReducer()
};

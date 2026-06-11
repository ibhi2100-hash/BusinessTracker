"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchReducer = void 0;
const shared_types_1 = require("@business/shared-types");
exports.BranchReducer = {
    initialState: () => ({
        id: "",
        name: "",
        address: "",
        phone: ""
    }),
    reduce(current, event) {
        switch (event.type) {
            case shared_types_1.BusinessEventTypes.BRANCH_CREATED:
                return {
                    id: event.payload.id,
                    name: event.payload.name,
                    Phone: event.payload.phone,
                    businessId: event.businessId,
                    isActive: true,
                    isDefault: true,
                    createdAt: event.createdAt,
                };
            default:
                return current;
        }
    }
};

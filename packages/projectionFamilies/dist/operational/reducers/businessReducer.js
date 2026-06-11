"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessReducer = void 0;
const shared_types_1 = require("@business/shared-types");
exports.BusinessReducer = {
    initialState: () => ({
        id: "",
        name: "",
        userId: "",
        address: "",
    }),
    reduce(current, event) {
        switch (event.type) {
            case shared_types_1.BusinessEventTypes.BUSINESS_CREATED:
                return {
                    id: event.payload.id,
                    name: event.payload.name,
                    address: event.payload.address,
                    userId: event.userId,
                    isOnboarding: true,
                    onboardingCompleted: false,
                    status: "ONBOARDING",
                    createdAt: event.createdAt,
                };
            case shared_types_1.BusinessEventTypes.BUSINESS_ACTIVATION:
                if (!current) {
                    return current;
                }
                return {
                    ...current,
                    activatedAt: event.createdAt,
                    isOnboarding: false,
                    onboardingCompleted: true,
                    status: "ACTIVE",
                };
            default:
                return current;
        }
    }
};

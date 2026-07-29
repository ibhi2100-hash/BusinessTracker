"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessReducer = void 0;
const shared_types_1 = require("@business/shared-types");
class BusinessReducer {
    reduce(state, event) {
        switch (event.type) {
            case shared_types_1.BusinessEventTypes.BUSINESS_CREATED:
                return this.created(event);
            case shared_types_1.BusinessEventTypes.BUSINESS_ACTIVATION:
                return this.activate(state, event);
            default:
                return state;
        }
    }
    created(event) {
        return {
            id: event.aggregateId,
            name: event.payload.name,
            address: event.payload.address,
            userId: event.actor.userId,
            status: "ONBOARDING",
            isOnboarding: true,
            onboardingCompleted: false,
            createdAt: event.metadata.occuredAt
        };
    }
    activate(current, event) {
        if (!current) {
            throw new Error("Business projection not found.");
        }
        return {
            ...current,
            activatedAt: event.metadata.occuredAt,
            status: "ACTIVE",
            isOnboarding: false,
            onboardingCompleted: true
        };
    }
}
exports.BusinessReducer = BusinessReducer;

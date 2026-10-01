import { BusinessEventTypes } from "@business/shared-types";
export class BusinessReducer {
    reduce(state, event) {
        switch (event.type) {
            case BusinessEventTypes.BUSINESS_CREATED:
                return this.created(event);
            case BusinessEventTypes.BUSINESS_ACTIVATION:
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
            createdAt: event.createdAt,
            activatedAt: event.createdAt,
        };
    }
    activate(current, event) {
        if (!current) {
            throw new Error("Business projection not found.");
        }
        return {
            ...current,
            activatedAt: event.createdAt,
            status: "ACTIVE",
            isOnboarding: false,
            onboardingCompleted: true
        };
    }
}

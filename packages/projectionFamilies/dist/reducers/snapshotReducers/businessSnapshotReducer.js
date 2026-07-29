"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSnapshotReducer = void 0;
exports.BusinessSnapshotReducer = {
    aggregateType: "BUSINESS",
    initialState() {
        return null;
    },
    reduce(current, event) {
        switch (event.type) {
            case "BUSINESS_CREATED":
                return {
                    id: event.aggregateId,
                    name: event.payload.name,
                    address: event.payload.address,
                    onboardingCompleted: false,
                    status: "ONBOARDING"
                };
            case "BUSINESS_ACTIVATION":
                if (!current) {
                    return current;
                }
                return {
                    ...current,
                    onboardingCompleted: true,
                    status: "ACTIVE"
                };
            default:
                return current;
        }
    }
};

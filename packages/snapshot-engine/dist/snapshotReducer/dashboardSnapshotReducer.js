"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSnapshotReducer = void 0;
exports.DashboardSnapshotReducer = {
    aggregateType: "DASHBOARD",
    initialState() {
        return {
            salesCount: 0,
            revenue: 0,
            inventoryValue: 0,
            profit: 0
        };
    },
    reduce(current, event) {
        switch (event.type) {
            case "SALE_ADDED":
                return {
                    ...current,
                    salesCount: current.salesCount + 1,
                    revenue: current.revenue +
                        event.payload.total,
                    profit: current.profit +
                        event.payload.profit
                };
            default:
                return current;
        }
    }
};

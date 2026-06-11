"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowWarningReducer = void 0;
exports.CashFlowWarningReducer = {
    initialState: () => [],
    reduce(state, metric) {
        if (metric.daysOfStockLeft > 7) {
            return state;
        }
        return [
            ...state,
            {
                id: crypto.randomUUID(),
                type: "REORDER",
                title: "Inventory Running Low",
                description: `${metric.productName}
           will run out in
           ${Math.floor(metric.daysOfStockLeft)} days`,
                confidence: 92,
                priority: metric.daysOfStockLeft <= 3
                    ? "HIGH"
                    : "MEDIUM",
                createdAt: Date.now()
            }
        ];
    }
};

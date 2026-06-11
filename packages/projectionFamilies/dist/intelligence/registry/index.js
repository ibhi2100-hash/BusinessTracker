"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intelligenceRegistry = void 0;
const reorderSuggestionReducer_1 = require("../reducers/reorderSuggestionReducer");
const SlowMovingStockReducer_1 = require("../reducers/SlowMovingStockReducer");
const CustomerRiskReducer_1 = require("../reducers/CustomerRiskReducer");
const CashFlowWarningReducer_1 = require("../reducers/CashFlowWarningReducer");
exports.intelligenceRegistry = {
    inventoryMetrics: [
        reorderSuggestionReducer_1.ReorderSuggestionReducer,
        SlowMovingStockReducer_1.SlowMovingStockReducer
    ],
    customerMetrics: [
        CustomerRiskReducer_1.CustomerRiskReducer
    ],
    profitMetrics: [
        CashFlowWarningReducer_1.CashFlowWarningReducer
    ]
};

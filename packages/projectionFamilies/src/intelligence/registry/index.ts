import { ReorderSuggestionReducer } from "../reducers/reorderSuggestionReducer";
import { SlowMovingStockReducer } from "../reducers/SlowMovingStockReducer";
import { CustomerRiskReducer } from "../reducers/CustomerRiskReducer";
import { CashFlowWarningReducer } from "../reducers/CashFlowWarningReducer";
export const intelligenceRegistry = {

  inventoryMetrics: [

    ReorderSuggestionReducer,

    SlowMovingStockReducer

  ],

  customerMetrics: [

    CustomerRiskReducer

  ],

  profitMetrics: [

    CashFlowWarningReducer

  ]

};
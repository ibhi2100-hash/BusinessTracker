export interface ProfitAndLossReport {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
}

export interface CashFlowReport {
    inflow: number;
    outflow: number;
    netCashFlow: number;
}

export interface BalanceSheetReport {
    assets: number;
    liabilities: number;
    equity: number;
}

export interface BusinessSummaryReport {
    revenue: number;
    profit: number;
    cashBalance: number;
    inventoryValue: number;
    outstandingLiabilities: number;
}

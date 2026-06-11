export interface AnalyticsReducer <State= any, Input=any> {
    initialState(): State;

    reduce(state: State, input: Input): State
}

export interface InventoryMetrics {
    productId: string;

    velocity: number;
    turnOverRate: number;
    daysOfStockLeft: number;

    totalSold: number;
    totalReceived: number;

    lastUpdated: number
}

export interface SalesMetrics {
    businessId: string;
    branchId: string;

    totalSales: number;
    transactionCount: number;
    averageBasketSize: number;

    growthRate: number;
}

export interface ProfitMetrics {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
}
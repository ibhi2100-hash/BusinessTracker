import { IntegrationEvent } from "@business/shared-types";
export declare const DashboardSnapshotReducer: {
    aggregateType: string;
    initialState(): {
        salesCount: number;
        revenue: number;
        inventoryValue: number;
        profit: number;
    };
    reduce(current: any, event: IntegrationEvent): any;
};

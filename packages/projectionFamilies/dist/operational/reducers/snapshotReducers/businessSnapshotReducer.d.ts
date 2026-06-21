import { IntegrationEvent } from "@business/shared-types";
export declare const BusinessSnapshotReducer: {
    aggregateType: string;
    initialState(): null;
    reduce(current: any, event: IntegrationEvent): any;
};

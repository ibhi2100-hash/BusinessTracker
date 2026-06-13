import { BaseEvent } from "@business/shared-types";
export declare const BusinessSnapshotReducer: {
    aggregateType: string;
    initialState(): null;
    reduce(current: any, event: BaseEvent): any;
};

import { DomainEvent } from "@business/shared-types";
export declare const BusinessSnapshotReducer: {
    aggregateType: string;
    initialState(): null;
    reduce(current: any, event: DomainEvent<any>): any;
};

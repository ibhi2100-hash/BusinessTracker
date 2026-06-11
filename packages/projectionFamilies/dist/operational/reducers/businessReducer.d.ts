import { BaseEvent } from "@business/shared-types";
export declare const BusinessReducer: {
    initialState: () => {
        id: string;
        name: string;
        userId: string;
        address: string;
    };
    reduce(current: any, event: BaseEvent): any;
};

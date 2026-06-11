import { BaseEvent } from "@business/shared-types";
export declare const BranchReducer: {
    initialState: () => {
        id: string;
        name: string;
        address: string;
        phone: string;
    };
    reduce(current: any, event: BaseEvent): any;
};

import { IntegrationEvent } from "@business/shared-types";
export declare const BusinessReducer: {
    initialState: () => {
        id: string;
        name: string;
        userId: string;
        address: string;
    };
    reduce(current: any, event: IntegrationEvent): any;
};

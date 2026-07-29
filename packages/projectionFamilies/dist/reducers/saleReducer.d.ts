import { IntegrationEvent } from "@business/shared-types";
export declare const SaleReducer: {
    initialState: () => {
        id: string;
        productId: string;
        price: number;
        costPrice: number;
        quantity: number;
        total: number;
    };
    reducer(current: any, event: IntegrationEvent): any;
};

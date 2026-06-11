import { BaseEvent } from "@business/shared-types";
export declare const SaleReducer: {
    initialState: () => {
        id: string;
        productId: string;
        price: number;
        costPrice: number;
        quantity: number;
        total: number;
    };
    reduce(current: any, event: BaseEvent): any;
};

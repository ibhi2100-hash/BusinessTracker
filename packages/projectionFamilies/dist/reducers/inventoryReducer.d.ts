import { DomainEvent } from "@business/shared-types";
export declare const InventoryReducer: {
    initialState: () => {
        id: string;
        productId: string;
        branchId: string;
        businessId: string;
        quantity: number;
        costPrice: number;
    };
    reduce(current: any, event: DomainEvent<any>): any;
};

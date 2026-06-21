import { IntegrationEvent, Product } from "@business/shared-types";
export declare const ProductReducer: {
    initialState: () => {
        id: string;
        businessId: string;
        branchId: string;
        name: string;
        imageUrl: string;
        description: string;
        costPrice: number;
        price: number;
        isDeleted: boolean;
    };
    reduce(current: any, event: IntegrationEvent): Product | null;
};

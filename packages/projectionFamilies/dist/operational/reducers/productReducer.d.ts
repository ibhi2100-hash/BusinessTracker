import { Product } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";
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
    reduce(current: Product | null, event: BaseEvent): Product | null;
};

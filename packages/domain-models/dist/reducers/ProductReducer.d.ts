import { Product } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";
export declare const ProductReducer: {
    reduce(current: Product | null, event: BaseEvent): Product | null;
};

import { ProductType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Decimal } from "@prisma/client/runtime/client";

export type Product = {
    id: string;
    name: string;
    type: ProductType;
    businessId: string;
    categoryId: string;
    brandId?: string;
    model?: string;
    costPrice?: Decimal;
    sellingPrice?: Decimal;
    quantity?: number;
    imei?: string;
    condition?: string;
    createdAt: Date;
    updatedAt: Date;
}
export  interface ProductFilter {
    categoryId?: string;
    type?: ProductType;
    inStock?: boolean; // true = quantity > 0
}
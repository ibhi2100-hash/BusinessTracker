import { Decimal } from "@prisma/client/runtime/client";

export type SaleItem = {
    id: string;
    saleId: string;
    productId: string;
    unitPrice: Decimal;
    totalPrice: Decimal;
    
}
import { Decimal } from "@prisma/client/runtime/client";

export type Sale = {
    id: string;
    businessId: string;
    totalAmount: Decimal;
    createdAt: Date;
}
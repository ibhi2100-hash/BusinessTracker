import { Decimal } from "@prisma/client/runtime/client";
import { PaymentMethod } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export type Payment = {
    id: string
    saleId: string;
    amount: Decimal;
    method: PaymentMethod;
    date: Date;

}
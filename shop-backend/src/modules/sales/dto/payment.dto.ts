import { IsNotEmpty, IsNumber } from "class-validator";
import { PaymentMethod } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export class paymentDto {
    @IsNotEmpty()
    @IsNumber()
    amount!: number;

    @IsNotEmpty()
    method!: PaymentMethod;
}
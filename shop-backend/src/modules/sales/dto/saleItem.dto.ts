import { IsNotEmpty, IsNumber,  } from "class-validator";

export class SaleItemDto {
    @IsNotEmpty()
    productId!: string;

    @IsNumber()
    @IsNotEmpty()
    quantity!: number;

    @IsNumber()
    @IsNotEmpty()
    unitPrice!: number

    @IsNotEmpty()
    @IsNumber()
    totalPrice!: number

}
import { IsNotEmpty, IsOptional, IsNumber, isNotEmpty } from "class-validator";
import { ProductType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export class ProductDto {
    @IsNotEmpty()
    name!: string;

    @IsNotEmpty()
    type!: ProductType;

    @IsNotEmpty()
    categoryId?: string;

    @IsNotEmpty()
    categoryName?: string;

    @IsOptional()
    brandId?: string;

    @IsNotEmpty()
    brandName?: string

    @IsOptional()
    model?: string;

    @IsNumber()
    @IsOptional()
    costPrice?: number;

    @IsNumber()
    @IsOptional()
    sellingPrice?: number;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsOptional()
    imei?: string;

    @IsOptional()
    condition?: string;
}
export class ProductUpdateDto {
    @IsNotEmpty()
    name?: string;

    @IsNotEmpty()
    type?: ProductType;

    @IsNotEmpty()
    categoryId?: string;

    @IsNotEmpty()
    categoryName?: string;

    @IsOptional()
    brandId?: string;

    @IsNotEmpty()
    brandName?: string

    @IsOptional()
    model?: string;

    @IsNumber()
    @IsOptional()
    costPrice?: number;

    @IsNumber()
    @IsOptional()
    sellingPrice?: number;

    @IsNumber()
    @IsOptional()
    quantity?: number;

    @IsOptional()
    imei?: string;

    @IsOptional()
    condition?: string;
}
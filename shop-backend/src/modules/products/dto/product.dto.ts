import { IsNotEmpty, IsOptional, IsNumber, isNotEmpty } from "class-validator";
import { ProductType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export interface ProductDto {

    name: string;

    
    type: ProductType;

    
    categoryId?: string;

    
    categoryName?: string;

    
    brandId?: string;

    
    brandName?: string


    model?: string;

    
    costPrice?: number;

    
    sellingPrice?: number;

    quantity?: number;

    imei?: string;

    condition?: string;

    stockMode?: "OPENING" | "PURCHASE"; // NEW
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
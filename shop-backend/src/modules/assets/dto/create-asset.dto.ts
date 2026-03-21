import { AssetType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export interface CreateAssetDto {
    id: string;
    name: string;
    purchaseCost: number;
    purchaseDate?: Date;
    assetType: AssetType;
    quantity: number;
    usefulLifeMonths: number;
    condition?: string;
    supplier?: string;
    salvageValue?: number;
}
export interface CreateAssetDto {
    name: string;
    category: string;
    purchaseCost: number;
    purchaseDate?: Date;
    quantity: number;
    usefulLifeMonths: number;
    condition?: string;
    supplier?: string;
    salvageValue?: number;
}
export type AssetType = {
    id:     string;
    businessId:     string;
    name:           string;
    category:       string;
    purchaseCost:   number;
    purchaseDate:   Date;
    totalCost:      number;
    currentValue:    number;
    quantity:       number;
    condition?:     string;
    supplier?:       string;
    usefulLifeMonths: number;
    salvageValue?:    number;
    disposedAt?:       Date;
    disposalAmount?:   number;
    createdAt:         Date;
    updatedAt:         Date;
}
export type Inventory = {
    id: string;
    productId: string;
    branchId: string;
    businessId: string;
    quantity: number;
    costPrice: number;
    updatedAt?: number;
    createdAt?: number;
};

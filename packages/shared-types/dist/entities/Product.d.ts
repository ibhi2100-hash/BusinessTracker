export type Product = {
    id: string;
    businessId: string;
    branchId: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    costPrice: number;
    price: number;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    reorderLevel: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: number;
    updatedAt: number | null;
    deletedAt: number | null;
};

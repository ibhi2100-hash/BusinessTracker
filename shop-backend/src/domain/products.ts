type InventorySnapshot = {
  products: {
    [productId: string]: {
      id: string;

      name: string;
      sku?: string;

      quantity: number;

      costPrice: number;
      price: number;

      inventoryValue: number;

      updatedAt: number;

      isDeleted?: boolean;
    };
  };
};

type ProductProjection = {
  totalSold: number;

  totalRevenue: number;

  totalCOGS: number;

  profit: number;

  lastSaleAt?: number;
};

export interface Product {
  id: string;
  businessId?: string;
  branchId?: string;
  name: string;
  imageUrl?: string;
  description?: string;

  costPrice: number;
  price: number;

  category?: string; 

  reorderLevel?: number;

  isActive: boolean;
  isDeleted?: boolean;

  createdAt?: number;
  updatedAt?: number;

  deletedAt?: number;
}
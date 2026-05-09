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
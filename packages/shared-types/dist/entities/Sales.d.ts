export interface Sales {
    id: string;
    businessId?: string;
    branchId?: string;
    productId: string;
    quantity: number;
    price: number;
    costPrice: number;
    total: number;
    userId: string;
    customerId?: string;
    invoiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

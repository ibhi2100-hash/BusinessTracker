export interface Inventory {
    id: number;
    productId: string;

    quantity: number;
    costPrice: number;

    createdAt:  number;
    updatedAt?: number
}
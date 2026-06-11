export interface SaleState {
    id: string;
    productId: string;
    quantity: number;
    total: number;
}
export interface BusinessState {
    id: string;
    name: string;
    isActive: boolean;
}
export interface InventoryState {
    productId: string;
    quantity: number;
    reserved?: number;
}
export interface ProductState {
    id: string;
    name: string;
    price: number;
    costPrice: number;
    isDeleted: boolean;
}

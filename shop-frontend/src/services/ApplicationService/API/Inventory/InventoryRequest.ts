import { Mode } from "@business/shared-types";

export interface InventoryRequest {
    id: string;
    productId: string;
    quantity: number;
    costPrice: number;
    mode: Mode;
}

export interface InventoryPayload {
    id: string;
    productId: string;
    quantity: number;
    costPrice: number;
}
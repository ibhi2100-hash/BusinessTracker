import type{ Mode } from "@business/shared-types";

export interface ProductRequest {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    price: number;
    costPrice: number;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    reorderLevel: number  | null;
    mode: Mode;
}

export interface ProductPayload {
    id: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    price: number;
    costPrice: number;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    reorderLevel: number  | null;

}
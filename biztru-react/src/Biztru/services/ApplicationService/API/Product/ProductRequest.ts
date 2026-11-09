import type{ Mode } from "@business/shared-types";
import type { BarcodeFormat } from "../../../../../components/inventory/barcodes/barcodeTypes";

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

export interface ProductDeletePayload {
    productId: string,
    createdAt: number
}

export interface ProductBarcodeAssign {
    barcode: string;
    barcodeFormat: BarcodeFormat
    barcodeSource: string;
    mode: Mode;
    productId: string;
}
import { Mode } from "@business/shared-types";

export interface ProductRequest {
   id: string;
   name: string;
   imageUrl?: string;
   description?: string;
   price: number;
   costPrice: number;
   mode: Mode;
}

export interface ProductPayload {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    price: number;
    costPrice: number;
}
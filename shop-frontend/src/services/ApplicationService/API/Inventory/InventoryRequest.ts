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

export interface ReceivedInventoryPayload {
    productId: string;
    quantity: number;
    costPrice: number;
    note?: string
}
export interface ReceiveInventoryRequest {
    aggregateId: string;
    mode: Mode;
    payload: ReceivedInventoryPayload
}

export interface AdjustInventoryPayload {
    productId: string;
    costPrice: number;
    direction: "increase" | "decrease"
    quantity: number;
    reason?: string
}

export interface AdjustInventoryRequest {
    aggregateId: string;
    mode: Mode;
    payload: AdjustInventoryPayload
}


export interface TransferInventoryPayload {
    productId: string;
    targetBranchId: string;
    quantity: number;
    note?: string
}

export interface TransferInventoryRequest {
    aggregateId: string;
    mode: Mode;
    payload: TransferInventoryPayload
}
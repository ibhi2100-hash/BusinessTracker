export type RefundStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

export type InventoryDisposition =
  | "RESTOCK"
  | "QUARANTINE"
  | "DAMAGED"
  | "NO_RESTOCK";

export interface RefundItem {
  id: string;
  refundId: string;
  businessId: string;
  branchId: string;
  originalSaleId: string;
  saleItemId: string | null;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  unitCostPrice: number;
  lineRefundAmount: number;
  lineCostAmount: number;
  inventoryDisposition: InventoryDisposition;
  createdAt: number;
}

export interface RefundPayment {
  id: string;
  refundId: string;
  businessId: string;
  branchId: string;
  paymentMethod: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reference: string | null;
  createdAt: number;
  completedAt: number | null;
}

export interface RefundProjection {
  id: string;
  businessId: string;
  branchId: string;
  originalSaleId: string;
  refundNumber: string;
  customerId: string | null;
  customerRef: string | null;
  reason: string | null;
  status: RefundStatus;
  refundMethod: string | null;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  userId: string | null;
  approvedBy: string | null;
  mode: string;
  createdAt: number;
  completedAt: number | null;
  updatedAt: number | null;
  items: RefundItem[];
  payments: RefundPayment[];
}

export interface RefundCompletedPayload {
  refundId: string;
  originalSaleId: string;
  refundNumber: string;
  customerId?: string | null;
  customerRef?: string | null;
  reason?: string | null;
  status: "COMPLETED";
  refundMethod?: string | null;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  userId?: string | null;
  approvedBy?: string | null;
  mode?: string;
  items: Array<{
    id: string;
    saleItemId?: string | null;
    productId: string;
    productName?: string | null;
    quantity: number;
    unitPrice: number;
    unitCostPrice: number;
    lineRefundAmount: number;
    lineCostAmount: number;
    inventoryDisposition: InventoryDisposition;
  }>;
  payments: Array<{
    id: string;
    paymentMethod: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    reference?: string | null;
    completedAt?: number | null;
  }>;
}

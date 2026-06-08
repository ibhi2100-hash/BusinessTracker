// /types/index.ts

// ---------------------------
// ENUMS
// ---------------------------


export type PaymentMethod = "CASH" | "TRANSFER" | "POS";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// ===========================
// SALE DOMAIN
// ===========================
export type SaleItem = {
  productId: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
};

export type SalePayload = {
  id?: string;
  businessId: string;
  branchId: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
};

// ---------------------------
// SESSION
// ---------------------------
export interface Session {
  userId: string;
  accessToken: string;
  expiresIn?: Date;
}

export interface BranchData {
  inventoryCount?: number;
  cashBalance?: number;
  lastSynced?: Date;
}
// SUBSCRIPTION / PLAN
// ---------------------------
export interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  maxUsers: number;
  maxBranch: number;
  maxProduct: number;
  maxStaff: number;
  features: string[];
  createdAt?: Date;
}

export interface BusinessSubscription {
  businessId: string;
  subscriptionId: string;
  startedAt: Date;
  expiresAt: Date;
  trialEndDate?: Date;
  status: SubscriptionStatus;
}
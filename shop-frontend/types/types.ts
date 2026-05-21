// /types/index.ts

// ---------------------------
// ENUMS
// ---------------------------
export type Role = "ADMIN" | "STAFF";

export type BranchRole = Role;

export type ProductType = "ACCESSORY" | "PHONE" | "SERVICE" | "OTHER";
export type ProductStockMode = "OPENING" | "LIVE";

export type PaymentMethod = "CASH" | "TRANSFER" | "POS";

export type CashFlowType =
  | "OPENING"
  | "OWNER_CAPITAL"
  | "OWNER_WITHDRAWAL"
  | "SALE_INCOME"
  | "PURCHASE_EXPENSE"
  | "ASSET_PURCHASE"
  | "ASSET_DISPOSAL"
  | "LIABILITY_PAYMENT"
  | "EXPENSE"
  | "REFUND";

export type CashFlowDirection = "IN" | "OUT";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// ===========================
// ACCOUNT SYSTEM (🔥 NEW CORE)
// ===========================
export type AccountType =
  | "CASH"
  | "SALES"
  | "COGS"
  | "INVENTORY"
  | "EXPENSE"
  | "CAPITAL";

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
// USER
// ---------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId?: string;
  branchId?: string;
  onboardingCompleted?: boolean;
  isActive?: boolean;
  createdAt?: Date;
}

// ---------------------------
// SESSION
// ---------------------------
export interface Session {
  userId: string;
  accessToken: string;
  expiresIn?: Date;
}

// ---------------------------
// BUSINESS
// ---------------------------
export interface Business {
  id: string;
  userId: string;
  name: string;
  address?: string;
  createdAt?: Date;
  activatedAt?: Date;
  isOnboarding?: boolean;
  onboardingCompleted?: boolean;
  status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
}

// ---------------------------
// BRANCH
// ---------------------------
export interface Branch {
  id: string;
  businessId?: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
}

export interface BranchData {
  inventoryCount?: number;
  cashBalance?: number;
  lastSynced?: Date;
}


// ---------------------------
// INVENTORY / PRODUCT
// ---------------------------
export interface Product {
  id: string;
  businessId?: string;
  branchId?: string;
  name: string;
  imageUrl?: string;
  description?: string;

  costPrice: number;
  price: number;

  category?: string; 

  reorderLevel?: number;

  isActive: boolean;
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  deletedAt?: Date;
}
// ---------------------------
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

// ---------------------------
// HYDRATION PAYLOAD
// ---------------------------
export interface HydrationPayload {
  user: User;
  accessToken: string;
  expiresIn?: number;

  business: Business;
  branches: Branch[];
  activeBranch?: Branch;
  inventory?: Product[];

  subscription?: BusinessSubscription;
}

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

// ===========================
// LEDGER CORE (FIXED)
// ===========================
export type LedgerTransaction = {
  id: string;
  businessId: string;
  branchId: string;
  description?: string;
  reference?: string;
  createdAt: number;
};

export type LedgerEntry = {
  id: string;
  transactionId: string;
  accountId: AccountType;
  debit: number;
  credit: number;
  businessId: string;
  branchId: string;
  createdAt: number;
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
  createdAt?: number;
}

// ---------------------------
// SESSION
// ---------------------------
export interface Session {
  userId: string;
  accessToken: string;
  expiresIn?: number;
}

// ---------------------------
// BUSINESS
// ---------------------------
export interface Business {
  id: string;
  userId: string;
  name: string;
  address?: string;
  createdAt?: number;
  activatedAt?: number;
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
  createdAt?: number;
}

export interface BranchData {
  inventoryCount?: number;
  cashBalance?: number;
  lastSynced?: number;
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

  cost: number;
  price: number;

  reorderLevel?: number;

  isActive: boolean;
  isDeleted?: boolean;

  createdAt?: number;
  updatedAt?: number;

  deletedAt?: number;
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
  createdAt?: number;
}

export interface BusinessSubscription {
  businessId: string;
  subscriptionId: string;
  startedAt: number;
  expiresAt: number;
  trialEndDate?: number;
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

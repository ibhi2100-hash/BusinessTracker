// /types/index.ts

// ---------------------------
// ENUMS
// ---------------------------
export type Role = "ADMIN" | "STAFF";

export type BranchRole = Role;

export type ProductType = "ACCESSORY" | "PHONE" | "SERVICE" | "OTHER";
export type ProductStockMode = "OPENING" | "LIVE";

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

export type PaymentMethod = "CASH" | "TRANSFER" | "POS";

export type SaleStatus = "COMPLETED" | "REFUNDED" | "VOIDED";

export type ExpenseStatus = "APPROVED" | "PENDING" | "CANCELLED";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

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
  name: string;
  address?: string;
  createdAt?: number;
  activatedAt?: number;
  onboardingStep?: number;
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
  token?: string;
}

export interface BranchData {
  inventoryCount?: number;
  cashBalance?: number;
  lastSynced?: number;
}

// ---------------------------
// CATEGORY
// ---------------------------
export interface Category {
  id: string;
  businessId?: string;
  branchId: string;
  name: string;
  imageUrl?: string;
  createdAt?: number;
}

// ---------------------------
// BRAND
// ---------------------------
export interface Brand {
  id: string;
  businessId?: string;
  branchId: string;
  categoryId: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
}

// ---------------------------
// INVENTORY / PRODUCT
// ---------------------------
export interface InventoryItem {
  id: string;
  businessId?: string;
  branchId: string;
  categoryId: string;
  brandId: string;

  name: string;
  type: ProductType;
  stockMode: ProductStockMode;

  model?: string;
  sku?: string;
  imageUrl?: string;
  description?: string;

  costPrice: number;
  sellingPrice: number;
  quantity: number;

  reorderLevel?: number;
  imei?: string;
  condition?: string;

  isActive?: boolean;
  isDeleted?: boolean;

  createdAt?: number;
  updatedAt?: number;
}

// ---------------------------
// CASH FLOW
// ---------------------------
export interface CashFlow {
  id: string;
  businessId?: string;
  branchId: string;
  type: CashFlowType;
  amount: number;
  direction: CashFlowDirection;
  balanceAfter?: number;
  source?: string;
  description?: string;
  isOpening?: boolean;
  isLocked?: boolean;
  createdAt?: number;
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

  categories?: Category[];
  brands?: Brand[];
  inventory?: InventoryItem[];
  cashFlows?: CashFlow[];

  subscription?: BusinessSubscription;
}

export type BillingPlanStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RETIRED";

export type BillingCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export type BillingPlanLimits = {
  maxStaff: number | null;
  maxBranches: number | null;
  maxProducts: number | null;
  maxStorageMb: number | null;
};

export type BillingPlanFeatures = Record<string, boolean>;

export interface BillingPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;

  priceMinor: string;
  currency: string;
  billingCycle: BillingCycle;

  trialDays: number;

  limits: BillingPlanLimits;
  features: BillingPlanFeatures;

  displayOrder: number;
  isFeatured: boolean;

  status: BillingPlanStatus;

  currentVersion: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingPlanInput {
  code: string;
  name: string;
  description?: string;

  priceMinor: string;
  currency: string;
  billingCycle: BillingCycle;

  trialDays: number;

  limits: BillingPlanLimits;
  features: BillingPlanFeatures;

  displayOrder: number;
  isFeatured: boolean;
}

export type UpdateBillingPlanInput =
  Partial<CreateBillingPlanInput>;

export interface BillingPlanResponse {
  plan: BillingPlan;
}

export interface BillingPlansResponse {
  plans: BillingPlan[];
}

export interface BillingPlanVersion {
  id: string;
  planId: string;
  version: number;
  snapshot: BillingPlan;
  createdAt: string;
  publishedAt: string | null;
}


import type {
  BillingCycle,
  BillingPlan,
  BillingPlanFeatures,
  BillingPlanLimits,
} from "./billing-plan.types";

export interface PublicBillingPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;

  priceMinor: string;
  currency: string;
  billingCycle: BillingCycle;

  trialDays: number;

  limits: BillingPlanLimits;
  features: BillingPlanFeatures;

  displayOrder: number;
  isFeatured: boolean;

  version: number;
  publishedAt: string;
}

export type BusinessSubscriptionStatus =
  | "PENDING"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export interface BusinessSubscription {
  id: string;
  businessId: string;
  planId: string;

  planVersion: number;
  planName: string;

  status: BusinessSubscriptionStatus;

  priceMinor: string;
  currency: string;
  billingCycle: BillingCycle;

  startedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;

  cancelAtPeriodEnd: boolean;
}

export interface PublicBillingCatalogue {
  revision: number;
  plans: PublicBillingPlan[];
  generatedAt: string;
}

export interface BusinessBillingState {
  subscription: BusinessSubscription | null;
  plans: PublicBillingPlan[];
  catalogueRevision: number;
  lastSyncedAt: string | null;
  isOffline: boolean;
}


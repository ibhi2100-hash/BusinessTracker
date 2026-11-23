
/* =========================================================
   ENUMS
========================================================= */

export type BillingPlanStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RETIRED"
  | "ARCHIVED";

export type BillingCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "LIFETIME";

/* =========================================================
   PLAN LIMITS
========================================================= */

export interface BillingPlanLimits {
  maxStaff: number;
  maxBranch: number;
  maxProduct: number;
  maxStorageMb?: number;
}

/* =========================================================
   PLAN FEATURES
========================================================= */

export type BillingPlanFeatures = Record<string, boolean>;

/* =========================================================
   PLAN VERSION
========================================================= */

export interface BillingPlanVersion {
  id: string;
  planId: string;

  // Sequential version number belonging to this plan.
  planVersion: number;

  // BigInt is serialized as a decimal string.
  priceMinor: string;

  currency: string;
  billingCycle: BillingCycle;
  intervalCount: number;

  trialDays: number;

  maxStaff: number;
  maxBranch: number;
  maxProduct: number;

  features: BillingPlanFeatures;

  publishedAt: string | null;
  createdAt: string;
}

/* =========================================================
   BILLING PLAN
========================================================= */

export interface BillingPlan {
  id: string;

  code: string;
  name: string;
  description: string | null;

  status: BillingPlanStatus;

  displayOrder: number;
  isFeatured: boolean;

  createdAt: string;
  updatedAt: string;

  // Versions are ordered by planVersion DESC from the API.
  versions: BillingPlanVersion[];
}

/* =========================================================
   CREATE PLAN VERSION INPUT
========================================================= */

export interface CreateBillingPlanVersionInput {
  priceMinor: string;
  currency: string;

  billingCycle: BillingCycle;
  intervalCount?: number;

  trialDays: number;

  maxStaff: number;
  maxBranch: number;
  maxProduct: number;

  features: BillingPlanFeatures;
}

/* =========================================================
   CREATE BILLING PLAN INPUT
========================================================= */

export interface CreateBillingPlanInput {
  code: string;
  name: string;
  description?: string | null;

  displayOrder: number;
  isFeatured: boolean;

  // Initial commercial configuration (version 1).
  initialVersion: CreateBillingPlanVersionInput;
}

/* =========================================================
   UPDATE BILLING PLAN INPUT
========================================================= */

// Updates stable plan metadata only.
// Pricing and entitlements must be changed through a new version.

export interface UpdateBillingPlanInput {
  code?: string;
  name?: string;
  description?: string | null;

  displayOrder?: number;
  isFeatured?: boolean;
}

/* =========================================================
   CREATE NEW VERSION INPUT
========================================================= */

export type CreateBillingPlanVersionRequest =
  CreateBillingPlanVersionInput;

/* =========================================================
   API RESPONSES
========================================================= */

export interface BillingPlanResponse {
  message?: string;
  plan: BillingPlan;
}

export interface BillingPlansResponse {
  plans: BillingPlan[];
  pagination?: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface BillingPlanVersionResponse {
  message?: string;
  version: BillingPlanVersion;
}

export interface BillingPlanVersionsResponse {
  versions: BillingPlanVersion[];
}

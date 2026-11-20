
export type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "TRIAL"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "CANCELLED"
  | "SUSPENDED";

export type BillingCycle = "MONTHLY" | "YEARLY";

export interface CommercialPlan {
  id: string;
  name: string;
  version: number;
  description: string;
  monthlyPriceMinor: number;
  yearlyPriceMinor: number;
  currency: string;
  maxBranches: number;
  maxEmployeesPerBranch: number;
  maxProductsPerBranch: number;
  active: boolean;
  subscriberCount: number;
}

export interface CommercialSubscription {
  id: string;
  businessId: string;
  businessName: string;
  planName: string;
  planVersion: number;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  priceMinor: number;
  currency: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface CommercialInvoice {
  id: string;
  invoiceNumber: string;
  businessName: string;
  amountMinor: number;
  currency: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "FAILED";
  issuedAt: string;
  dueAt: string;
}

export interface CommercialOverview {
  mrrMinor: number;
  arrMinor: number;
  collectedMinor: number;
  outstandingMinor: number;
  activeSubscriptions: number;
  overdueInvoices: number;
}

export interface BusinessSubscription {
  id: string;
  businessId: string;

  planId: string;
  planVersion: number;

  status:
    | "TRIAL"
    | "ACTIVE"
    | "PAST_DUE"
    | "SUSPENDED"
    | "CANCELLED"
    | "EXPIRED";

  billingCycle: "MONTHLY" | "YEARLY";

  priceMinor: number;
  currency: string;

  currentPeriodStart: number;
  currentPeriodEnd: number;

  cancelAtPeriodEnd: boolean;

  aggregateVersion: number;
  updatedAt: number;
}
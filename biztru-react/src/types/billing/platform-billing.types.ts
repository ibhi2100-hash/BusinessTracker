
import type {
  BusinessSubscriptionStatus,
} from "./business-billing.types";

export interface PlatformSubscription {
  id: string;
  businessId: string;
  businessName: string;

  planId: string;
  planName: string;
  planVersion: number;

  status: BusinessSubscriptionStatus;

  priceMinor: string;
  currency: string;
  billingCycle: string;

  startedAt: string | null;
  currentPeriodEnd: string | null;

  cancelAtPeriodEnd: boolean;
}

export interface PlatformBillingMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRecurringRevenueMinor: string;
  currency: string;
}

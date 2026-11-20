export type ProjectionSource = "TENANT_EVENT" | "BILLING_EVENT";

export interface TenantProjectionSnapshot {
  businessId: string;
  businessName: string;
  businessStatus: "ONBOARDING" | "ACTIVE" | "SUSPENDED";

  registeredAt: Date;
  activatedAt: Date | null;

  totalBranches: number;
  activeBranches: number;

  totalEmployees: number;
  activeEmployees: number;

  totalProducts: number;

  totalSubscriptions: number;
  activeSubscriptions: number;

  currentPlanId: string | null;
  currentPlanVersion: number | null;
  currentSubscriptionStatus: string | null;

  currency: string | null;
  recurringAmountMinor: bigint;

  lastActivityAt: Date | null;
  lastSyncAt: Date | null;
}

export interface ProjectionEvent {
  id: string;
  eventType: string;
  businessId: string | null;
  occurredAt: Date;
  payload: unknown;
}

export interface ProjectionConsumerResult {
  processed: number;
  skipped: number;
  failed: number;
  lastProcessedId?: string;
}

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsDashboardSummary {
  businesses: {
    total: number;
    active: number;
    onboarding: number;
    suspended: number;
  };

  branches: {
    total: number;
    active: number;
  };

  employees: {
    total: number;
    active: number;
  };

  products: {
    total: number;
  };

  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    suspended: number;
    cancelled: number;
  };

  revenue: {
    currency: string;
    grossCollectedMinor: string;
    refundsMinor: string;
    netCollectedMinor: string;
    outstandingMinor: string;
    recurringRevenueMinor: string;
  };

  projection: {
    lastUpdatedAt: Date | null;
    tenantEventPosition: string;
  };
}
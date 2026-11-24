import { BusinessManager } from "../../../../Composer/BusinessManager";
import type { LocalBillingCycle } from "../../../../offline/sqlite/businessDatabase/repositories/SQLiteBillings/SQLitePlanVersion";

/* =========================================================
   TYPES
========================================================= */

export type BillingMode = "OPENING" | "LIVE";

export type BillingSubscriptionStatus =
  | "PENDING"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type BillingRequestType =
  | "NEW"
  | "UPGRADE"
  | "DOWNGRADE"
  | "RENEWAL";

export interface BillingPlanRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BillingPlanVersionRecord {
  id: string;
  planId: string;
  planVersion: number;
  priceMinor: string;
  currency: string;
  billingCycle: LocalBillingCycle;
  intervalCount: number;
  trialDays: number;
  maxStaff: number;
  maxBranch: number;
  maxProduct: number;
  features: Record<string, unknown>;
  publishedAt: number | null;
  createdAt: number;
}

export interface BillingSubscriptionRecord {
  id: string;
  businessId: string;
  planId: string;
  planVersion: number;
  status: BillingSubscriptionStatus;
  billingCycle: string;
  currency: string;
  priceMinor: string;
  trialStart: number | null;
  trialEnd: number | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  gracePeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  activatedAt: number | null;
  cancelledAt: number | null;
  expiredAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingEntitlementRecord {
  id: string;
  businessId: string;
  subscriptionId: string;
  entitlementKey: string;
  valueJson: string;
  source: "PLAN" | "OVERRIDE";
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  validFrom: number;
  validUntil: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingOverrideRecord {
  id: string;
  businessId: string;
  subscriptionId: string;
  entitlementKey: string;
  valueJson: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  reason: string | null;
  startsAt: number;
  expiresAt: number | null;
  createdBy: string | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingInvoiceRecord {
  id: string;
  businessId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  subtotalMinor: string;
  taxMinor: string;
  discountMinor: string;
  totalMinor: string;
  amountPaidMinor: string;
  amountDueMinor: string;
  periodStart: number | null;
  periodEnd: number | null;
  issuedAt: number | null;
  dueAt: number | null;
  paidAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingPaymentRecord {
  id: string;
  businessId: string;
  subscriptionId: string;
  invoiceId: string | null;
  provider: string | null;
  providerReference: string | null;
  method: string | null;
  status: string;
  currency: string;
  amountMinor: string;
  refundedMinor: string;
  initiatedAt: number | null;
  confirmedAt: number | null;
  failedAt: number | null;
  reversedAt: number | null;
  refundedAt: number | null;
  failureReason: string | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingSubscriptionRequestRecord {
  id: string;
  businessId: string;
  requestedPlanId: string;
  requestedPlanVersion: number;
  requestType: BillingRequestType;
  status: string;
  requestedBy: string;
  reviewedBy: string | null;
  reviewedAt: number | null;
  rejectionReason: string | null;
  effectiveAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface BillingLeaseRecord {
  id: string;
  businessId: string;
  subscriptionId: string;
  branchId: string;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  gracePeriodEnd: number | null;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  entitlementSnapshotJson: string;
  signedToken: string;
  revokedAt: number | null;
  aggregateVersion: number;
  lastEventId: string | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * The backend returns one consistent billing snapshot.
 *
 * A snapshot is applied as one local transaction.
 * Do not independently commit each repository.
 */
export interface BillingSyncSnapshot {
  businessId: string;
  branchId: string | null;
  deviceId: string;
  serverTime: number;
  cursor: string | null;

  plans: BillingPlanRecord[];
  planVersions: BillingPlanVersionRecord[];

  subscription: BillingSubscriptionRecord | null;
  entitlements: BillingEntitlementRecord[];
  overrides: BillingOverrideRecord[];
  invoices: BillingInvoiceRecord[];
  payments: BillingPaymentRecord[];
  requests: BillingSubscriptionRequestRecord[];
  leases: BillingLeaseRecord[];
}

export interface BillingSyncResult {
  businessId: string;
  syncedAt: number;
  cursor: string | null;
  subscription: BillingSubscriptionRecord | null;
  entitlementCount: number;
  invoiceCount: number;
  paymentCount: number;
  leaseCount: number;
}

export interface CreateSubscriptionRequest {
  planId: string;
  planVersion: number;
  requestType: BillingRequestType;
  branchId?: string;
  note?: string;
  idempotencyKey?: string;
}

export interface RefreshBillingLeaseRequest {
  branchId: string;
  deviceId: string;
}

export interface BillingLocalFilters {
  businessId: string;
  branchId?: string;
  status?: string;
  from?: number;
  to?: number;
  limit?: number;
  offset?: number;
}

/* =========================================================
   BACKEND TRANSPORT
========================================================= */

/**
 * Implement this using your existing authenticated HTTP client.
 *
 * It must attach the logged-in user's access token and handle
 * your backend's normal response/error format.
 */
export interface BillingBackendClient {
  get<T>(
    path: string,
    options?: {
      signal?: AbortSignal;
    }
  ): Promise<T>;

  post<T>(
    path: string,
    body: unknown,
    options?: {
      idempotencyKey?: string;
      signal?: AbortSignal;
    }
  ): Promise<T>;
}

/* =========================================================
   LOCAL SQLITE GATEWAY
========================================================= */

/**
 * This is the adapter between BillingApi and the local
 * SQLite billing repositories.
 *
 * applySnapshot MUST:
 * 1. Validate the snapshot business/device identity.
 * 2. Reject stale aggregate versions.
 * 3. Detect same-version conflicts.
 * 4. Preserve immutable published plan versions.
 * 5. Build operations using each repository's upsertOperation().
 * 6. Commit all operations in ONE SQLite transaction.
 *
 * The implementation should use your existing worker
 * transaction coordinator.
 */
export interface BillingLocalGateway {
  applySnapshot(
    app: Awaited<ReturnType<BusinessManager["current"]>>,
    snapshot: BillingSyncSnapshot
  ): Promise<void>;

  getSubscription(
    businessId: string
  ): Promise<BillingSubscriptionRecord | null>;

  getSubscriptionHistory(
    businessId: string
  ): Promise<BillingSubscriptionRecord[]>;

  getEntitlements(
    businessId: string
  ): Promise<BillingEntitlementRecord[]>;

  getEntitlement(
    businessId: string,
    entitlementKey: string
  ): Promise<BillingEntitlementRecord | null>;

  getInvoices(
    filters: BillingLocalFilters
  ): Promise<BillingInvoiceRecord[]>;

  getInvoice(
    invoiceId: string
  ): Promise<BillingInvoiceRecord | null>;

  getPayments(
    filters: BillingLocalFilters
  ): Promise<BillingPaymentRecord[]>;

  getPayment(
    paymentId: string
  ): Promise<BillingPaymentRecord | null>;

  getSubscriptionRequests(
    businessId: string
  ): Promise<BillingSubscriptionRequestRecord[]>;

  getLeases(
    businessId: string,
    branchId?: string,
    deviceId?: string
  ): Promise<BillingLeaseRecord[]>;

  getCurrentLease(
    businessId: string,
    branchId: string,
    deviceId: string
  ): Promise<BillingLeaseRecord | null>;

  getPlans(): Promise<BillingPlanRecord[]>;

  getPlanVersions(
    planId: string
  ): Promise<BillingPlanVersionRecord[]>;
}

/* =========================================================
   API
========================================================= */

export class BillingApi {
  private readonly manager: BusinessManager;
  private readonly backend: BillingBackendClient;
  private readonly local: BillingLocalGateway;

  constructor(
    manager: BusinessManager,
    backend: BillingBackendClient,
    local: BillingLocalGateway
  ) {
    this.manager = manager;
    this.backend = backend;
    this.local = local;
  }

  private async getApp() {
    const app = await this.manager.current();

    if (!app) {
      throw new Error("Business does not exist");
    }

    return app;
  }

  private assertBusiness(
    snapshot: BillingSyncSnapshot,
    businessId: string
  ): void {
    if (snapshot.businessId !== businessId) {
      throw new Error(
        "Billing synchronization rejected: business identity mismatch"
      );
    }
  }

  /* =====================================================
     1. BACKEND SYNCHRONIZATION
  ===================================================== */

  /**
   * Fetches the authoritative billing state from the backend
   * and updates the local SQLite projections.
   *
   * The subscription is business-wide.
   * The lease is scoped to the requesting branch/device.
   */
  async syncBilling(options: {
    branchId?: string;
    deviceId: string;
    signal?: AbortSignal;
  }): Promise<BillingSyncResult> {
    const app = await this.getApp();

    if (!options.deviceId) {
      throw new Error("Device ID is required for billing sync");
    }

    const businessId = app.businessId;

    if (!businessId) {
      throw new Error("Business ID is missing");
    }

    const params = new URLSearchParams({
      deviceId: options.deviceId,
    });

    if (options.branchId) {
      params.set("branchId", options.branchId);
    }

    const snapshot = await this.backend.get<BillingSyncSnapshot>(
      `/business/billing/sync?${params.toString()}`,
      { signal: options.signal }
    );

    this.assertBusiness(snapshot, businessId);

    if (snapshot.deviceId !== options.deviceId) {
      throw new Error(
        "Billing synchronization rejected: device identity mismatch"
      );
    }

    if (
      options.branchId &&
      snapshot.branchId !== options.branchId
    ) {
      throw new Error(
        "Billing synchronization rejected: branch identity mismatch"
      );
    }

    await this.local.applySnapshot(app, snapshot);

    return {
      businessId,
      syncedAt: snapshot.serverTime,
      cursor: snapshot.cursor,
      subscription: snapshot.subscription,
      entitlementCount: snapshot.entitlements.length,
      invoiceCount: snapshot.invoices.length,
      paymentCount: snapshot.payments.length,
      leaseCount: snapshot.leases.length,
    };
  }

  /**
   * Refresh only the branch/device lease.
   *
   * The backend must authenticate the device and determine
   * whether it is entitled to receive a new lease.
   */
  async refreshLease(
    request: RefreshBillingLeaseRequest
  ): Promise<BillingLeaseRecord> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    const lease = await this.backend.post<BillingLeaseRecord>(
      "/business/billing/leases/refresh",
      {
        branchId: request.branchId,
        deviceId: request.deviceId,
      }
    );

    if (lease.businessId !== app.businessId) {
      throw new Error("Lease business identity mismatch");
    }

    if (
      lease.branchId !== request.branchId ||
      lease.deviceId !== request.deviceId
    ) {
      throw new Error("Lease branch/device identity mismatch");
    }

    /**
     * Do not trust a lease merely because it came from local
     * storage. The local adapter must verify its signature
     * against the pinned platform public key before use.
     */
    await this.syncBilling({
      branchId: request.branchId,
      deviceId: request.deviceId,
    });

    return lease;
  }

  /* =====================================================
     2. SUBSCRIPTION REQUESTS
  ===================================================== */

  /**
   * A business requests a plan transition.
   *
   * This does not directly activate or change a subscription.
   * The platform reviews and approves the request.
   */
  async requestSubscription(
    request: CreateSubscriptionRequest
  ): Promise<{ requestId: string }> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    if (!request.planId || request.planVersion < 1) {
      throw new Error("A valid plan and plan version are required");
    }

    const idempotencyKey =
      request.idempotencyKey ?? crypto.randomUUID();

    const response = await this.backend.post<{
      requestId: string;
    }>(
      "/business/billing/subscription-requests",
      {
        planId: request.planId,
        planVersion: request.planVersion,
        requestType: request.requestType,
        branchId: request.branchId,
        note: request.note,
      },
      { idempotencyKey }
    );

    return response;
  }

  /* =====================================================
     3. LOCAL SUBSCRIPTION READS
  ===================================================== */

  async getSubscription(): Promise<BillingSubscriptionRecord | null> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getSubscription(app.businessId);
  }

  async getSubscriptionHistory(): Promise<BillingSubscriptionRecord[]> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getSubscriptionHistory(app.businessId);
  }

  /* =====================================================
     4. LOCAL ENTITLEMENT READS
  ===================================================== */

  async getEntitlements(): Promise<BillingEntitlementRecord[]> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getEntitlements(app.businessId);
  }

  async getEntitlement(
    entitlementKey: string
  ): Promise<BillingEntitlementRecord | null> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getEntitlement(
      app.businessId,
      entitlementKey
    );
  }

  /* =====================================================
     5. INVOICES
  ===================================================== */

  async getInvoices(
    filters: Omit<BillingLocalFilters, "businessId">
  ): Promise<BillingInvoiceRecord[]> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getInvoices({
      ...filters,
      businessId: app.businessId,
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0,
    });
  }

  async getInvoice(
    invoiceId: string
  ): Promise<BillingInvoiceRecord | null> {
    await this.getApp();
    return this.local.getInvoice(invoiceId);
  }

  /* =====================================================
     6. PAYMENTS
  ===================================================== */

  async getPayments(
    filters: Omit<BillingLocalFilters, "businessId">
  ): Promise<BillingPaymentRecord[]> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getPayments({
      ...filters,
      businessId: app.businessId,
      limit: filters.limit ?? 100,
      offset: filters.offset ?? 0,
    });
  }

  async getPayment(
    paymentId: string
  ): Promise<BillingPaymentRecord | null> {
    await this.getApp();
    return this.local.getPayment(paymentId);
  }

  /* =====================================================
     7. SUBSCRIPTION REQUEST HISTORY
  ===================================================== */

  async getSubscriptionRequests(): Promise<
    BillingSubscriptionRequestRecord[]
  > {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getSubscriptionRequests(app.businessId);
  }

  /* =====================================================
     8. BRANCH / DEVICE LEASES
  ===================================================== */

  async getLeases(options?: {
    branchId?: string;
    deviceId?: string;
  }): Promise<BillingLeaseRecord[]> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getLeases(
      app.businessId,
      options?.branchId,
      options?.deviceId
    );
  }

  async getCurrentLease(
    branchId: string,
    deviceId: string
  ): Promise<BillingLeaseRecord | null> {
    const app = await this.getApp();

    if (!app.businessId) {
      throw new Error("Business ID is missing");
    }

    return this.local.getCurrentLease(
      app.businessId,
      branchId,
      deviceId
    );
  }

  /* =====================================================
     9. LOCAL PLAN CATALOGUE
  ===================================================== */

  async getPlans(): Promise<BillingPlanRecord[]> {
    await this.getApp();
    return this.local.getPlans();
  }

  async getPlanVersions(
    planId: string
  ): Promise<BillingPlanVersionRecord[]> {
    await this.getApp();
    return this.local.getPlanVersions(planId);
  }

  /* =====================================================
     10. CONVENIENCE METHODS
  ===================================================== */

  async isSubscriptionActive(): Promise<boolean> {
    const subscription = await this.getSubscription();

    if (!subscription) {
      return false;
    }

    return (
      subscription.status === "ACTIVE" ||
      subscription.status === "TRIALING" ||
      subscription.status === "GRACE_PERIOD"
    );
  }

  async getSubscriptionStatus(): Promise<
    BillingSubscriptionStatus | "NO_SUBSCRIPTION"
  > {
    const subscription = await this.getSubscription();

    return subscription?.status ?? "NO_SUBSCRIPTION";
  }

  async getBranchBillingAccess(options: {
    branchId: string;
    deviceId: string;
  }): Promise<{
    subscription: BillingSubscriptionRecord | null;
    lease: BillingLeaseRecord | null;
    hasLease: boolean;
    leaseExpired: boolean;
  }> {
    const [subscription, lease] = await Promise.all([
      this.getSubscription(),
      this.getCurrentLease(options.branchId, options.deviceId),
    ]);

    const now = Date.now();

    return {
      subscription,
      lease,
      hasLease: Boolean(
        lease &&
        lease.status === "ACTIVE" &&
        lease.expiresAt > now
      ),
      leaseExpired: Boolean(
        lease && lease.expiresAt <= now
      ),
    };
  }
}

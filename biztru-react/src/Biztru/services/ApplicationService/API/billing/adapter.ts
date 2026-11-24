
import type { BusinessManager } from "../../../../Composer/BusinessManager";
import type { BusinessRepositoryRegistry } from "../../../../offline/sqlite/businessDatabase/repositories/RepositoryRegistry";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";
import type { TransactionManager } from "../../../../storage/transaction/TransactionManager";

import type {
  BillingLocalGateway,
  BillingSyncSnapshot,
  BillingPlanRecord,
  BillingPlanVersionRecord,
  BillingSubscriptionRecord,
  BillingEntitlementRecord,
  BillingInvoiceRecord,
  BillingPaymentRecord,
  BillingSubscriptionRequestRecord,
  BillingLeaseRecord,
  BillingLocalFilters,
} from "./billingplanApi";

/* =========================================================
   TYPES
========================================================= */

type BusinessApp = NonNullable<
  Awaited<ReturnType<BusinessManager["current"]>>
>;


/**
 * Plan version local schema stores features as JSON text.
 * The backend API sends features as a JSON object.
 */



/* =========================================================
   SNAPSHOT VALIDATION
========================================================= */
interface BillingSyncIdentity {
  businessId: string;
  branchId: string;
  deviceId: string;
}

function assertSyncIdentity(
  snapshot: BillingSyncSnapshot,
  expected: BillingSyncIdentity
): void {
  if (snapshot.businessId !== expected.businessId) {
    throw new Error("Billing business identity mismatch");
  }

  if (snapshot.branchId !== expected.branchId) {
    throw new Error("Billing branch identity mismatch");
  }

  if (snapshot.deviceId !== expected.deviceId) {
    throw new Error("Billing device identity mismatch");
  }

  if (!Number.isFinite(snapshot.serverTime)) {
    throw new Error("Invalid billing server time");
  }

  const ownLease = snapshot.leases.find(
    lease =>
      lease.businessId === expected.businessId &&
      lease.branchId === expected.branchId &&
      lease.deviceId === expected.deviceId
  );

  if (!ownLease) {
    throw new Error("Device lease missing from billing snapshot");
  }
}
function assertBusinessRecords(
  records: Array<{ businessId: string }>,
  businessId: string,
  collectionName: string
): void {
  for (const record of records) {
    if (record.businessId !== businessId) {
      throw new Error(
        `Billing sync rejected: ${collectionName} contains a record belonging to another business`
      );
    }
  }
}

function assertUniqueIds<T extends { id: string }>(
  records: T[],
  collectionName: string
): void {
  const ids = new Set<string>();

  for (const record of records) {
    if (!record.id) {
      throw new Error(
        `Billing sync rejected: ${collectionName} contains a record without an ID`
      );
    }

    if (ids.has(record.id)) {
      throw new Error(
        `Billing sync rejected: duplicate ID in ${collectionName}: ${record.id}`
      );
    }

    ids.add(record.id);
  }
}

function assertSnapshot(
  snapshot: BillingSyncSnapshot,
  expectedBusinessId: string,
  expectedDeviceId?: string,
  expectedBranchId?: string
): void {
  if (!snapshot) {
    throw new Error("Billing snapshot is missing");
  }

  if (snapshot.businessId !== expectedBusinessId) {
    throw new Error("Billing snapshot business ID mismatch");
  }

  if (
    expectedDeviceId &&
    snapshot.deviceId !== expectedDeviceId
  ) {
    throw new Error("Billing snapshot device ID mismatch");
  }

  if (
    expectedBranchId &&
    snapshot.branchId !== expectedBranchId
  ) {
    throw new Error("Billing snapshot branch ID mismatch");
  }

  if (!Number.isFinite(snapshot.serverTime)) {
    throw new Error("Billing snapshot has an invalid server time");
  }

  const collections = [
    ["plans", snapshot.plans],
    ["plan versions", snapshot.planVersions],
    ["entitlements", snapshot.entitlements],
    ["overrides", snapshot.overrides],
    ["invoices", snapshot.invoices],
    ["payments", snapshot.payments],
    ["requests", snapshot.requests],
    ["leases", snapshot.leases],
  ] as const;

  for (const [name, records] of collections) {
    if (!Array.isArray(records)) {
      throw new Error(
        `Billing snapshot has an invalid ${name} collection`
      );
    }

    assertUniqueIds(
      records as Array<{ id: string }>,
      name
    );
  }

  if (
    snapshot.subscription &&
    !snapshot.subscription.id
  ) {
    throw new Error(
      "Billing snapshot subscription has no ID"
    );
  }

  assertBusinessRecords(
    snapshot.entitlements,
    expectedBusinessId,
    "entitlements"
  );

  assertBusinessRecords(
    snapshot.overrides,
    expectedBusinessId,
    "overrides"
  );

  assertBusinessRecords(
    snapshot.invoices,
    expectedBusinessId,
    "invoices"
  );

  assertBusinessRecords(
    snapshot.payments,
    expectedBusinessId,
    "payments"
  );

  assertBusinessRecords(
    snapshot.requests,
    expectedBusinessId,
    "subscription requests"
  );

  assertBusinessRecords(
    snapshot.leases,
    expectedBusinessId,
    "leases"
  );

  if (
    snapshot.subscription &&
    snapshot.subscription.businessId !== expectedBusinessId
  ) {
    throw new Error(
      "Billing snapshot subscription belongs to another business"
    );
  }

  for (const lease of snapshot.leases) {
    if (
      expectedBranchId &&
      lease.branchId !== expectedBranchId
    ) {
      throw new Error(
        "Billing snapshot contains a lease for another branch"
      );
    }

    if (
      expectedDeviceId &&
      lease.deviceId !== expectedDeviceId
    ) {
      throw new Error(
        "Billing snapshot contains a lease for another device"
      );
    }
  }
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizePlanVersion(
  record: BillingPlanVersionRecord
): BillingPlanVersionRecord {
  return {
    id: record.id,
    planId: record.planId,
    planVersion: record.planVersion,
    priceMinor: record.priceMinor,
    currency: record.currency,
    billingCycle: record.billingCycle,
    intervalCount: record.intervalCount,
    trialDays: record.trialDays,
    maxStaff: record.maxStaff,
    maxBranch: record.maxBranch,
    maxProduct: record.maxProduct,
    features: record.features ?? {},
    publishedAt: record.publishedAt,
    createdAt: record.createdAt,
  };
}
function shouldApplyAggregate(
  incomingVersion: number,
  localVersion: number
): boolean {
  return incomingVersion > localVersion;
}

/* =========================================================
   SQLITE BILLING LOCAL GATEWAY
========================================================= */

export class SQLiteBillingLocalGateway
  implements BillingLocalGateway
{
  private readonly repositories: BusinessRepositoryRegistry;
  private readonly executeTransaction: TransactionManager;

  constructor(options: {
    repositories: BusinessRepositoryRegistry;
    executeTransaction: TransactionManager;
  }) {
    this.repositories = options.repositories;
    this.executeTransaction = options.executeTransaction;
  }

  /* =====================================================
     APPLY BACKEND SNAPSHOT
  ===================================================== */

  /**
   * Converts the backend billing snapshot into SQLite
   * operations and commits all operations atomically.
   *
   * No HTTP requests happen here.
   * BillingApi is responsible for fetching the snapshot.
   */
  async applySnapshot(
    app: BusinessApp,
    snapshot: BillingSyncSnapshot
  ): Promise<void> {
    const businessId = app.businessId;

    if (!businessId) {
      throw new Error("Business ID is missing");
    }

    assertSnapshot(
      snapshot,
      businessId,
      snapshot.deviceId,
      snapshot.branchId ?? undefined
    );


    const operations: SQLiteStatementOperation[] = [];

    /* -----------------------------------------------
       1. PLAN CATALOGUE
    ----------------------------------------------- */

    for (const plan of snapshot.plans) {
      operations.push(
        this.repositories.billingPlans.upsertOperation(plan)
      );
    }

    /* -----------------------------------------------
       2. PLAN VERSIONS
    ----------------------------------------------- */

    for (const version of snapshot.planVersions) {
      operations.push(
        this.repositories.billingPlanVersion.insertOperation(
          normalizePlanVersion(version)
        )
      );
    }

    /* -----------------------------------------------
       3. BUSINESS SUBSCRIPTION
    ----------------------------------------------- */

    if (snapshot.subscription) {
      operations.push(
        this.repositories.billingSubscription.upsertOperation(
          snapshot.subscription
        )
      );
    }

    /* -----------------------------------------------
       4. EFFECTIVE ENTITLEMENTS
    ----------------------------------------------- */

    for (const entitlement of snapshot.entitlements) {
      operations.push(
        this.repositories.entitlement.upsertOperation(
          entitlement
        )
      );
    }

    /* -----------------------------------------------
       5. ENTITLEMENT OVERRIDES
    ----------------------------------------------- */

    for (const override of snapshot.overrides) {
      operations.push(
        this.repositories.entitlementOverrides.upsertOperation(
          override
        )
      );
    }

    /* -----------------------------------------------
       6. INVOICES
    ----------------------------------------------- */

    for (const invoice of snapshot.invoices) {
      operations.push(
        this.repositories.billingInvoice.upsertOperation(
          invoice
        )
      );
    }

    /* -----------------------------------------------
       7. PAYMENTS
    ----------------------------------------------- */

    for (const payment of snapshot.payments) {
      operations.push(
        this.repositories.billingPayments.upsertOperation(
          payment
        )
      );
    }

    /* -----------------------------------------------
       8. SUBSCRIPTION REQUESTS
    ----------------------------------------------- */

    for (const request of snapshot.requests) {
      operations.push(
        this.repositories.billingRequest.upsertOperation(
          request
        )
      );
    }

    /* -----------------------------------------------
       9. BRANCH / DEVICE LEASES
    ----------------------------------------------- */

    for (const lease of snapshot.leases) {
      operations.push(
        this.repositories.billinglease.upsertOperation(
          lease
        )
      );
    }

    /* -----------------------------------------------
       ATOMIC COMMIT
    ----------------------------------------------- */

    if (operations.length === 0) {
      return;
    }

    await this.executeTransaction.run(operations);
  }

  /* =====================================================
     SUBSCRIPTIONS
  ===================================================== */

  async getSubscription(
    businessId: string
  ): Promise<BillingSubscriptionRecord | null> {
    return this.repositories.billingSubscription.findCurrentByBusiness(
      businessId
    );
  }

  async getSubscriptionHistory(
    businessId: string
  ): Promise<BillingSubscriptionRecord[]> {
    return this.repositories.billingSubscription.findHistoryByBusiness(
      businessId
    );
  }

  /* =====================================================
     ENTITLEMENTS
  ===================================================== */

  async getEntitlements(
    businessId: string
  ): Promise<BillingEntitlementRecord[]> {
    return this.repositories.entitlement.findByBusiness(
      businessId
    );
  }

  async getEntitlement(
    businessId: string,
    entitlementKey: string
  ): Promise<BillingEntitlementRecord | null> {
    return this.repositories.entitlement.findByBusinessAndKey(
      businessId,
      entitlementKey
    );
  }

  /* =====================================================
     INVOICES
  ===================================================== */

  async getInvoices(
    filters: BillingLocalFilters
  ): Promise<BillingInvoiceRecord[]> {
    return this.repositories.billingInvoice.findByBusiness(filters);
  }

  async getInvoice(
    invoiceId: string
  ): Promise<BillingInvoiceRecord | null> {
    return this.repositories.billingInvoice.findById(invoiceId);
  }

  /* =====================================================
     PAYMENTS
  ===================================================== */

  async getPayments(
    filters: BillingLocalFilters
  ): Promise<BillingPaymentRecord[]> {
    return this.repositories.billingPayments.findByBusiness(filters);
  }

  async getPayment(
    paymentId: string
  ): Promise<BillingPaymentRecord | null> {
    return this.repositories.billingPayments.findById(paymentId);
  }

  /* =====================================================
     SUBSCRIPTION REQUESTS
  ===================================================== */

  async getSubscriptionRequests(
    businessId: string
  ): Promise<BillingSubscriptionRequestRecord[]> {
    return this.repositories.billingRequest.findByBusiness(
      businessId
    );
  }

  /* =====================================================
     LEASES
  ===================================================== */

  async getLeases(
    businessId: string,
    branchId?: string,
    deviceId?: string
  ): Promise<BillingLeaseRecord[]> {
    return this.repositories.billinglease.findByBusiness(
      businessId,
      branchId,
      deviceId
    );
  }

  async getCurrentLease(
    businessId: string,
    branchId: string,
    deviceId: string
  ): Promise<BillingLeaseRecord | null> {
    return this.repositories.billinglease.findActiveByBusiness(
      businessId,
      branchId,
      deviceId
    );
  }

  /* =====================================================
     PLAN CATALOGUE
  ===================================================== */

  async getPlans(): Promise<BillingPlanRecord[]> {
    return this.repositories.billingPlans.getAll();
  }

  async getPlanVersions(
    planId: string
  ): Promise<BillingPlanVersionRecord[]> {
    const records =
      await this.repositories.billingPlans.findById(
        planId
      );

    if(!records) {
        throw Error("new The Record for version does not exist at all")
    }

    return records.map(record => ({
      id: record.id,
      planId: record.planId,
      planVersion: record.planVersion,
      priceMinor: record.priceMinor,
      currency: record.currency,
      billingCycle: record.billingCycle,
      intervalCount: record.intervalCount,
      trialDays: record.trialDays,
      maxStaff: record.maxStaff,
      maxBranch: record.maxBranch,
      maxProduct: record.maxProduct,
      features: JSON.parse(record.featuresJson || "{}"),
      publishedAt: record.publishedAt,
      createdAt: record.createdAt,
    }));
  }
}

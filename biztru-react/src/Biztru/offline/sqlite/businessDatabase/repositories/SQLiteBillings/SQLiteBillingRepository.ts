
/* ============================================================
   BILLING PROJECTION TYPES
   All timestamps are Unix milliseconds.
   All monetary values are integer minor units (kobo).
   ============================================================ */

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

export type SubscriptionStatus =
  | "PENDING"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE_PERIOD"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type EntitlementStatus =
  | "ACTIVE"
  | "REVOKED"
  | "EXPIRED";

export type EntitlementSource =
  | "PLAN"
  | "OVERRIDE";

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "VOIDED"
  | "CANCELLED";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "REVERSED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type SubscriptionRequestType =
  | "NEW"
  | "UPGRADE"
  | "DOWNGRADE"
  | "RENEWAL";

export type SubscriptionRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type SubscriptionLeaseStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED";

/* ============================================================
   PLAN
   ============================================================ */

export interface BillingPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: BillingPlanStatus;
  displayOrder: number;
  isFeatured: number;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   PLAN VERSION
   Published versions must remain immutable.
   ============================================================ */

export interface BillingPlanVersion {
  id: string;
  planId: string;
  planVersion: number;
  priceMinor: number;
  currency: string;
  billingCycle: BillingCycle;
  intervalCount: number;
  trialDays: number;
  maxStaff: number | null;
  maxBranch: number | null;
  maxProduct: number | null;
  featuresJson: string;
  publishedAt: number | null;
  createdAt: number;
}

/* ============================================================
   SUBSCRIPTION
   ============================================================ */

export interface BillingSubscription {
  id: string;
  businessId: string;
  planId: string;
  planVersion: number;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currency: string;
  priceMinor: number;
  trialStartsAt: number | null;
  trialEndsAt: number | null;
  currentPeriodStartsAt: number | null;
  currentPeriodEndsAt: number | null;
  gracePeriodEndsAt: number | null;
  cancelAtPeriodEnd: number;
  activatedAt: number | null;
  cancelledAt: number | null;
  expiredAt: number | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   EFFECTIVE ENTITLEMENT
   ============================================================ */

export interface BillingEntitlement {
  id: string;
  businessId: string;
  subscriptionId: string | null;
  entitlementKey: string;
  valueJson: string;
  source: EntitlementSource;
  status: EntitlementStatus;
  validFrom: number | null;
  validUntil: number | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   ENTITLEMENT OVERRIDE
   ============================================================ */

export interface BillingEntitlementOverride {
  id: string;
  businessId: string;
  subscriptionId: string | null;
  entitlementKey: string;
  valueJson: string;
  status: EntitlementStatus;
  reason: string | null;
  startsAt: number | null;
  expiresAt: number | null;
  createdBy: string | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   INVOICE
   ============================================================ */

export interface BillingInvoice {
  id: string;
  businessId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  amountDueMinor: number;
  periodStart: number | null;
  periodEnd: number | null;
  issuedAt: number | null;
  dueAt: number | null;
  paidAt: number | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   PAYMENT
   ============================================================ */

export interface BillingPayment {
  id: string;
  businessId: string;
  subscriptionId: string | null;
  invoiceId: string | null;
  provider: string | null;
  providerReference: string | null;
  method: string | null;
  status: PaymentStatus;
  currency: string;
  amountMinor: number;
  refundedMinor: number;
  initiatedAt: number | null;
  confirmedAt: number | null;
  failedAt: number | null;
  reversedAt: number | null;
  refundedAt: number | null;
  failureReason: string | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   SUBSCRIPTION REQUEST
   ============================================================ */

export interface BillingSubscriptionRequest {
  id: string;
  businessId: string;
  requestedPlanId: string;
  requestedPlanVersion: number;
  requestType: SubscriptionRequestType;
  status: SubscriptionRequestStatus;
  requestedBy: string;
  reviewedBy: string | null;
  reviewedAt: number | null;
  rejectionReason: string | null;
  effectiveAt: number | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}

/* ============================================================
   OFFLINE SUBSCRIPTION LEASE
   ============================================================ */

export interface BillingSubscriptionLease {
  id: string;
  businessId: string;
  subscriptionId: string;
  branchId: string;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  gracePeriodEnd: number | null;
  status: SubscriptionLeaseStatus;
  entitlementSnapshotJson: string;
  signedToken: string;
  revokedAt: number | null;
  aggregateVersion: number;
  lastEventId: string;
  createdAt: number;
  updatedAt: number;
}



import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";
import { BillingMapper } from "./BillingMapper";

type BillingEntity =
    | Parameters<typeof BillingMapper.planToInsert>[0]
    | Parameters<typeof BillingMapper.planVersionToInsert>[0]
    | Parameters<typeof BillingMapper.subscriptionToInsert>[0]
    | Parameters<typeof BillingMapper.entitlementToInsert>[0]
    | Parameters<typeof BillingMapper.entitlementOverrideToInsert>[0]
    | Parameters<typeof BillingMapper.invoiceToInsert>[0]
    | Parameters<typeof BillingMapper.paymentToInsert>[0]
    | Parameters<typeof BillingMapper.subscriptionRequestToInsert>[0]
    | Parameters<typeof BillingMapper.subscriptionLeaseToInsert>[0];

export interface BillingWriteStatement {
    execute(params?: readonly unknown[]): Promise<unknown>;
}

export interface BillingRepositoryConfig<T> {
    statementKey: string;
    statement: BillingWriteStatement;
    mapper: (entity: T) => unknown[];
}

/**
 * Shared write implementation for Billing projection repositories.
 *
 * Immediate writes are useful for direct repository operations.
 * Operation builders allow ProjectionConsumers to collect writes
 * and execute them in one SQLite transaction.
 */
export class SQLiteBillingRepository<T extends BillingEntity> {
    protected readonly statementKey: string;
    protected readonly statement: BillingWriteStatement;
    protected readonly mapper: (entity: T) => unknown[];

    constructor(config: BillingRepositoryConfig<T>) {
        this.statementKey = config.statementKey;
        this.statement = config.statement;
        this.mapper = config.mapper;
    }

    async upsert(entity: T): Promise<void> {
        const params = this.mapper(entity);
        await this.statement.execute(params);
    }

    upsertOperation(entity: T): SQLiteStatementOperation {
        return {
            statementKey: this.statementKey,
            params: this.mapper(entity),
        };
    }

    upsertManyOperation(
        entities: readonly T[],
    ): SQLiteStatementOperation[] {
        return entities.map((entity) => this.upsertOperation(entity));
    }
}

import { BillingMapper } from "./BillingMapper";
import {
    SQLiteBillingRepository,
    type BillingWriteStatement,
} from "./SQLiteBillingRepository";

interface BillingRepositoryOptions {
    statementKey: string;
    statement: BillingWriteStatement;
}

export class SQLiteBillingPlanRepository
    extends SQLiteBillingRepository<BillingPlan> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.planToInsert,
        });
    }
}

export class SQLiteBillingPlanVersionRepository
    extends SQLiteBillingRepository<BillingPlanVersion> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.planVersionToInsert,
        });
    }
}

export class SQLiteBillingSubscriptionRepository
    extends SQLiteBillingRepository<BillingSubscription> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.subscriptionToInsert,
        });
    }
}

export class SQLiteBillingEntitlementRepository
    extends SQLiteBillingRepository<BillingEntitlement> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.entitlementToInsert,
        });
    }
}

export class SQLiteBillingEntitlementOverrideRepository
    extends SQLiteBillingRepository<BillingEntitlementOverride> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.entitlementOverrideToInsert,
        });
    }
}

export class SQLiteBillingInvoiceRepository
    extends SQLiteBillingRepository<BillingInvoice> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.invoiceToInsert,
        });
    }
}

export class SQLiteBillingPaymentRepository
    extends SQLiteBillingRepository<BillingPayment> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.paymentToInsert,
        });
    }
}

export class SQLiteBillingSubscriptionRequestRepository
    extends SQLiteBillingRepository<BillingSubscriptionRequest> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.subscriptionRequestToInsert,
        });
    }
}

export class SQLiteBillingSubscriptionLeaseRepository
    extends SQLiteBillingRepository<BillingSubscriptionLease> {
    constructor(options: BillingRepositoryOptions) {
        super({
            ...options,
            mapper: BillingMapper.subscriptionLeaseToInsert,
        });
    }
}

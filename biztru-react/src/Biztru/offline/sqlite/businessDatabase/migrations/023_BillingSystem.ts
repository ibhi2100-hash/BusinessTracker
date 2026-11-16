
import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration023: Migration = {
    version: 23,

    name: "Billing",

    up(): readonly SQLiteMigrationOperation[] {
        return [

            /* ====================================================== */
            /* 1. BILLING PLANS                                       */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_plans (
                        id TEXT PRIMARY KEY,

                        code TEXT NOT NULL UNIQUE,
                        name TEXT NOT NULL,
                        description TEXT,

                        status TEXT NOT NULL DEFAULT 'DRAFT'
                            CHECK (
                                status IN (
                                    'DRAFT',
                                    'PUBLISHED',
                                    'RETIRED',
                                    'ARCHIVED'
                                )
                            ),

                        displayOrder INTEGER NOT NULL DEFAULT 0,
                        isFeatured INTEGER NOT NULL DEFAULT 0
                            CHECK (isFeatured IN (0, 1)),

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_plans_status
                    ON billing_plans(status);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_plans_display_order
                    ON billing_plans(displayOrder);
                `,
            },

            /* ====================================================== */
            /* 2. IMMUTABLE PLAN VERSIONS                             */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_plan_versions (
                        id TEXT PRIMARY KEY,

                        planId TEXT NOT NULL,
                        planVersion INTEGER NOT NULL,

                        priceMinor INTEGER NOT NULL DEFAULT 0
                            CHECK (priceMinor >= 0),

                        currency TEXT NOT NULL DEFAULT 'NGN',

                        billingCycle TEXT NOT NULL
                            CHECK (
                                billingCycle IN (
                                    'MONTHLY',
                                    'QUARTERLY',
                                    'YEARLY',
                                    'LIFETIME'
                                )
                            ),

                        intervalCount INTEGER NOT NULL DEFAULT 1
                            CHECK (intervalCount > 0),

                        trialDays INTEGER NOT NULL DEFAULT 0
                            CHECK (trialDays >= 0),

                        maxStaff INTEGER,
                        maxBranch INTEGER,
                        maxProduct INTEGER,

                        featuresJson TEXT NOT NULL DEFAULT '{}',

                        publishedAt INTEGER,

                        createdAt INTEGER NOT NULL,

                        UNIQUE(planId, planVersion)
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_plan_versions_plan
                    ON billing_plan_versions(
                        planId,
                        planVersion
                    );
                `,
            },

            /* ====================================================== */
            /* 3. BUSINESS SUBSCRIPTIONS                              */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_subscriptions (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        planId TEXT NOT NULL,
                        planVersion INTEGER NOT NULL,

                        status TEXT NOT NULL
                            CHECK (
                                status IN (
                                    'PENDING',
                                    'TRIALING',
                                    'ACTIVE',
                                    'PAST_DUE',
                                    'GRACE_PERIOD',
                                    'SUSPENDED',
                                    'CANCELLED',
                                    'EXPIRED'
                                )
                            ),

                        billingCycle TEXT NOT NULL,

                        currency TEXT NOT NULL,

                        priceMinor INTEGER NOT NULL DEFAULT 0
                            CHECK (priceMinor >= 0),

                        trialStart INTEGER,
                        trialEnd INTEGER,

                        currentPeriodStart INTEGER,
                        currentPeriodEnd INTEGER,

                        gracePeriodEnd INTEGER,

                        cancelAtPeriodEnd INTEGER NOT NULL DEFAULT 0
                            CHECK (cancelAtPeriodEnd IN (0, 1)),

                        activatedAt INTEGER,
                        cancelledAt INTEGER,
                        expiredAt INTEGER,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_subscriptions_business
                    ON billing_subscriptions(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_subscriptions_status
                    ON billing_subscriptions(
                        businessId,
                        status
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_subscriptions_period
                    ON billing_subscriptions(
                        businessId,
                        currentPeriodEnd
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_subscriptions_plan
                    ON billing_subscriptions(
                        planId,
                        planVersion
                    );
                `,
            },

            /* ====================================================== */
            /* 4. EFFECTIVE ENTITLEMENTS                              */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_entitlements (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,
                        subscriptionId TEXT NOT NULL,

                        entitlementKey TEXT NOT NULL,

                        valueJson TEXT NOT NULL DEFAULT 'null',

                        source TEXT NOT NULL
                            CHECK (
                                source IN (
                                    'PLAN',
                                    'OVERRIDE'
                                )
                            ),

                        status TEXT NOT NULL DEFAULT 'ACTIVE'
                            CHECK (
                                status IN (
                                    'ACTIVE',
                                    'REVOKED',
                                    'EXPIRED'
                                )
                            ),

                        validFrom INTEGER,
                        validUntil INTEGER,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL,

                        UNIQUE(businessId, entitlementKey)
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_entitlements_business
                    ON billing_entitlements(
                        businessId,
                        status
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_entitlements_subscription
                    ON billing_entitlements(subscriptionId);
                `,
            },

            /* ====================================================== */
            /* 5. ENTITLEMENT OVERRIDES                               */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_entitlement_overrides (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,
                        subscriptionId TEXT NOT NULL,

                        entitlementKey TEXT NOT NULL,

                        valueJson TEXT NOT NULL DEFAULT 'null',

                        status TEXT NOT NULL DEFAULT 'ACTIVE'
                            CHECK (
                                status IN (
                                    'ACTIVE',
                                    'REVOKED',
                                    'EXPIRED'
                                )
                            ),

                        reason TEXT,

                        startsAt INTEGER,
                        expiresAt INTEGER,

                        createdBy TEXT,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_entitlement_overrides_business
                    ON billing_entitlement_overrides(
                        businessId,
                        entitlementKey
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_entitlement_overrides_subscription
                    ON billing_entitlement_overrides(subscriptionId);
                `,
            },

            /* ====================================================== */
            /* 6. INVOICES                                            */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_invoices (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,
                        subscriptionId TEXT NOT NULL,

                        invoiceNumber TEXT,

                        status TEXT NOT NULL
                            CHECK (
                                status IN (
                                    'DRAFT',
                                    'ISSUED',
                                    'PARTIALLY_PAID',
                                    'PAID',
                                    'OVERDUE',
                                    'VOIDED',
                                    'CANCELLED'
                                )
                            ),

                        currency TEXT NOT NULL,

                        subtotalMinor INTEGER NOT NULL DEFAULT 0,
                        taxMinor INTEGER NOT NULL DEFAULT 0,
                        discountMinor INTEGER NOT NULL DEFAULT 0,

                        totalMinor INTEGER NOT NULL DEFAULT 0,
                        amountPaidMinor INTEGER NOT NULL DEFAULT 0,
                        amountDueMinor INTEGER NOT NULL DEFAULT 0,

                        periodStart INTEGER,
                        periodEnd INTEGER,

                        issuedAt INTEGER,
                        dueAt INTEGER,
                        paidAt INTEGER,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_invoices_business
                    ON billing_invoices(
                        businessId,
                        createdAt
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_invoices_subscription
                    ON billing_invoices(subscriptionId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_invoices_status
                    ON billing_invoices(
                        businessId,
                        status
                    );
                `,
            },

            {
                sql: `
                    CREATE UNIQUE INDEX IF NOT EXISTS
                    idx_billing_invoices_number
                    ON billing_invoices(
                        businessId,
                        invoiceNumber
                    )
                    WHERE invoiceNumber IS NOT NULL;
                `,
            },

            /* ====================================================== */
            /* 7. PAYMENTS                                            */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_payments (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        subscriptionId TEXT,
                        invoiceId TEXT,

                        provider TEXT,
                        providerReference TEXT,

                        method TEXT,

                        status TEXT NOT NULL
                            CHECK (
                                status IN (
                                    'INITIATED',
                                    'PENDING',
                                    'CONFIRMED',
                                    'FAILED',
                                    'REVERSED',
                                    'REFUNDED',
                                    'PARTIALLY_REFUNDED'
                                )
                            ),

                        currency TEXT NOT NULL,

                        amountMinor INTEGER NOT NULL
                            CHECK (amountMinor >= 0),

                        refundedMinor INTEGER NOT NULL DEFAULT 0
                            CHECK (refundedMinor >= 0),

                        initiatedAt INTEGER,
                        confirmedAt INTEGER,
                        failedAt INTEGER,
                        reversedAt INTEGER,
                        refundedAt INTEGER,

                        failureReason TEXT,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_payments_business
                    ON billing_payments(
                        businessId,
                        createdAt
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_payments_invoice
                    ON billing_payments(invoiceId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_payments_subscription
                    ON billing_payments(subscriptionId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_payments_status
                    ON billing_payments(
                        businessId,
                        status
                    );
                `,
            },

            {
                sql: `
                    CREATE UNIQUE INDEX IF NOT EXISTS
                    idx_billing_payments_provider_reference
                    ON billing_payments(
                        provider,
                        providerReference
                    )
                    WHERE providerReference IS NOT NULL;
                `,
            },

            /* ====================================================== */
            /* 8. SUBSCRIPTION REQUESTS                               */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_subscription_requests (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        requestedPlanId TEXT NOT NULL,
                        requestedPlanVersion INTEGER NOT NULL,

                        requestType TEXT NOT NULL
                            CHECK (
                                requestType IN (
                                    'NEW',
                                    'UPGRADE',
                                    'DOWNGRADE',
                                    'RENEWAL'
                                )
                            ),

                        status TEXT NOT NULL
                            CHECK (
                                status IN (
                                    'PENDING',
                                    'APPROVED',
                                    'REJECTED',
                                    'CANCELLED'
                                )
                            ),

                        requestedBy TEXT,

                        reviewedBy TEXT,
                        reviewedAt INTEGER,

                        rejectionReason TEXT,

                        effectiveAt INTEGER,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_subscription_requests_business
                    ON billing_subscription_requests(
                        businessId,
                        status
                    );
                `,
            },

            /* ====================================================== */
            /* 9. OFFLINE ENTITLEMENT LEASES                           */
            /* ====================================================== */

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS billing_subscription_leases (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,
                        subscriptionId TEXT NOT NULL,

                        branchId TEXT,
                        deviceId TEXT NOT NULL,

                        issuedAt INTEGER NOT NULL,
                        expiresAt INTEGER NOT NULL,

                        gracePeriodEnd INTEGER,

                        status TEXT NOT NULL DEFAULT 'ACTIVE'
                            CHECK (
                                status IN (
                                    'ACTIVE',
                                    'EXPIRED',
                                    'REVOKED'
                                )
                            ),

                        entitlementSnapshotJson TEXT NOT NULL DEFAULT '{}',

                        signedToken TEXT NOT NULL,

                        revokedAt INTEGER,

                        aggregateVersion INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_leases_business
                    ON billing_subscription_leases(
                        businessId,
                        status
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_leases_device
                    ON billing_subscription_leases(
                        businessId,
                        branchId,
                        deviceId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_billing_leases_expiry
                    ON billing_subscription_leases(expiresAt);
                `,
            },

        ];
    },
};

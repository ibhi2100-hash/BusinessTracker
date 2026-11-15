
/* ================================================================ */
/* BILLING PLANS                                                     */
/* ================================================================ */

export const BILLING_PLAN_UPSERT = `
    INSERT INTO billing_plans (
        id, code, name, description, status,
        displayOrder, isFeatured, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        name = excluded.name,
        description = excluded.description,
        status = excluded.status,
        displayOrder = excluded.displayOrder,
        isFeatured = excluded.isFeatured,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_PLAN_FIND_BY_ID = `
    SELECT *
    FROM billing_plans
    WHERE id = ?;
`;

export const BILLING_PLAN_FIND_BY_CODE = `
    SELECT *
    FROM billing_plans
    WHERE code = ?;
`;

export const BILLING_PLAN_LIST = `
    SELECT *
    FROM billing_plans
    WHERE (? IS NULL OR status = ?)
    ORDER BY displayOrder ASC, name ASC;
`;

/* ================================================================ */
/* BILLING PLAN VERSIONS                                             */
/* ================================================================ */

export const BILLING_PLAN_VERSION_UPSERT = `
    INSERT INTO billing_plan_versions (
        id, planId, planVersion, priceMinor, currency,
        billingCycle, intervalCount, trialDays,
        maxStaff, maxBranch, maxProduct,
        featuresJson, publishedAt, createdAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING;
`;

export const BILLING_PLAN_VERSION_FIND_BY_ID = `
    SELECT *
    FROM billing_plan_versions
    WHERE id = ?;
`;

export const BILLING_PLAN_VERSION_FIND_BY_NUMBER = `
    SELECT *
    FROM billing_plan_versions
    WHERE planId = ?
      AND planVersion = ?;
`;

export const BILLING_PLAN_VERSION_LIST = `
    SELECT *
    FROM billing_plan_versions
    WHERE planId = ?
    ORDER BY planVersion DESC;
`;

/* ================================================================ */
/* BUSINESS SUBSCRIPTIONS                                            */
/* ================================================================ */

export const BILLING_SUBSCRIPTION_UPSERT = `
    INSERT INTO billing_subscriptions (
        id, businessId, planId, planVersion, status,
        billingCycle, currency, priceMinor,
        trialStart, trialEnd,
        currentPeriodStart, currentPeriodEnd,
        gracePeriodEnd, cancelAtPeriodEnd,
        activatedAt, cancelledAt, expiredAt,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
        planId = excluded.planId,
        planVersion = excluded.planVersion,
        status = excluded.status,
        billingCycle = excluded.billingCycle,
        currency = excluded.currency,
        priceMinor = excluded.priceMinor,
        trialStart = excluded.trialStart,
        trialEnd = excluded.trialEnd,
        currentPeriodStart = excluded.currentPeriodStart,
        currentPeriodEnd = excluded.currentPeriodEnd,
        gracePeriodEnd = excluded.gracePeriodEnd,
        cancelAtPeriodEnd = excluded.cancelAtPeriodEnd,
        activatedAt = excluded.activatedAt,
        cancelledAt = excluded.cancelledAt,
        expiredAt = excluded.expiredAt,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_SUBSCRIPTION_FIND_BY_ID = `
    SELECT *
    FROM billing_subscriptions
    WHERE id = ?;
`;

export const BILLING_SUBSCRIPTION_FIND_BY_BUSINESS = `
    SELECT *
    FROM billing_subscriptions
    WHERE businessId = ?
    ORDER BY createdAt DESC
    LIMIT 1;
`;

export const BILLING_SUBSCRIPTION_LIST = `
    SELECT *
    FROM billing_subscriptions
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?;
`;

/* ================================================================ */
/* EFFECTIVE ENTITLEMENTS                                            */
/* ================================================================ */

export const BILLING_ENTITLEMENT_UPSERT = `
    INSERT INTO billing_entitlements (
        id, businessId, subscriptionId,
        entitlementKey, valueJson, source, status,
        validFrom, validUntil,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        subscriptionId = excluded.subscriptionId,
        entitlementKey = excluded.entitlementKey,
        valueJson = excluded.valueJson,
        source = excluded.source,
        status = excluded.status,
        validFrom = excluded.validFrom,
        validUntil = excluded.validUntil,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_ENTITLEMENT_FIND_BY_ID = `
    SELECT *
    FROM billing_entitlements
    WHERE id = ?;
`;

export const BILLING_ENTITLEMENT_FIND_BY_KEY = `
    SELECT *
    FROM billing_entitlements
    WHERE businessId = ?
      AND entitlementKey = ?;
`;

export const BILLING_ENTITLEMENT_LIST = `
    SELECT *
    FROM billing_entitlements
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY entitlementKey ASC;
`;

/* ================================================================ */
/* ENTITLEMENT OVERRIDES                                             */
/* ================================================================ */

export const BILLING_ENTITLEMENT_OVERRIDE_UPSERT = `
    INSERT INTO billing_entitlement_overrides (
        id, businessId, subscriptionId,
        entitlementKey, valueJson, status,
        reason, startsAt, expiresAt, createdBy,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        subscriptionId = excluded.subscriptionId,
        entitlementKey = excluded.entitlementKey,
        valueJson = excluded.valueJson,
        status = excluded.status,
        reason = excluded.reason,
        startsAt = excluded.startsAt,
        expiresAt = excluded.expiresAt,
        createdBy = excluded.createdBy,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_ENTITLEMENT_OVERRIDE_FIND_BY_ID = `
    SELECT *
    FROM billing_entitlement_overrides
    WHERE id = ?;
`;

export const BILLING_ENTITLEMENT_OVERRIDE_LIST = `
    SELECT *
    FROM billing_entitlement_overrides
    WHERE businessId = ?
      AND (? IS NULL OR entitlementKey = ?)
    ORDER BY createdAt DESC;
`;

/* ================================================================ */
/* INVOICES                                                          */
/* ================================================================ */

export const BILLING_INVOICE_UPSERT = `
    INSERT INTO billing_invoices (
        id, businessId, subscriptionId,
        invoiceNumber, status, currency,
        subtotalMinor, taxMinor, discountMinor,
        totalMinor, amountPaidMinor, amountDueMinor,
        periodStart, periodEnd,
        issuedAt, dueAt, paidAt,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
        invoiceNumber = excluded.invoiceNumber,
        status = excluded.status,
        currency = excluded.currency,
        subtotalMinor = excluded.subtotalMinor,
        taxMinor = excluded.taxMinor,
        discountMinor = excluded.discountMinor,
        totalMinor = excluded.totalMinor,
        amountPaidMinor = excluded.amountPaidMinor,
        amountDueMinor = excluded.amountDueMinor,
        periodStart = excluded.periodStart,
        periodEnd = excluded.periodEnd,
        issuedAt = excluded.issuedAt,
        dueAt = excluded.dueAt,
        paidAt = excluded.paidAt,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_INVOICE_FIND_BY_ID = `
    SELECT *
    FROM billing_invoices
    WHERE id = ?;
`;

export const BILLING_INVOICE_FIND_BY_NUMBER = `
    SELECT *
    FROM billing_invoices
    WHERE businessId = ?
      AND invoiceNumber = ?;
`;

export const BILLING_INVOICE_LIST = `
    SELECT *
    FROM billing_invoices
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?;
`;

export const BILLING_INVOICE_LIST_BY_SUBSCRIPTION = `
    SELECT *
    FROM billing_invoices
    WHERE businessId = ?
      AND subscriptionId = ?
    ORDER BY createdAt DESC;
`;

/* ================================================================ */
/* PAYMENTS                                                          */
/* ================================================================ */

export const BILLING_PAYMENT_UPSERT = `
    INSERT INTO billing_payments (
        id, businessId, subscriptionId, invoiceId,
        provider, providerReference, method, status,
        currency, amountMinor, refundedMinor,
        initiatedAt, confirmedAt, failedAt,
        reversedAt, refundedAt, failureReason,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
        subscriptionId = excluded.subscriptionId,
        invoiceId = excluded.invoiceId,
        provider = excluded.provider,
        providerReference = excluded.providerReference,
        method = excluded.method,
        status = excluded.status,
        currency = excluded.currency,
        amountMinor = excluded.amountMinor,
        refundedMinor = excluded.refundedMinor,
        initiatedAt = excluded.initiatedAt,
        confirmedAt = excluded.confirmedAt,
        failedAt = excluded.failedAt,
        reversedAt = excluded.reversedAt,
        refundedAt = excluded.refundedAt,
        failureReason = excluded.failureReason,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_PAYMENT_FIND_BY_ID = `
    SELECT *
    FROM billing_payments
    WHERE id = ?;
`;

export const BILLING_PAYMENT_FIND_BY_PROVIDER_REFERENCE = `
    SELECT *
    FROM billing_payments
    WHERE provider = ?
      AND providerReference = ?;
`;

export const BILLING_PAYMENT_LIST = `
    SELECT *
    FROM billing_payments
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?;
`;

export const BILLING_PAYMENT_LIST_BY_INVOICE = `
    SELECT *
    FROM billing_payments
    WHERE businessId = ?
      AND invoiceId = ?
    ORDER BY createdAt DESC;
`;

/* ================================================================ */
/* SUBSCRIPTION REQUESTS                                             */
/* ================================================================ */

export const BILLING_SUBSCRIPTION_REQUEST_UPSERT = `
    INSERT INTO billing_subscription_requests (
        id, businessId,
        requestedPlanId, requestedPlanVersion,
        requestType, status, requestedBy,
        reviewedBy, reviewedAt, rejectionReason,
        effectiveAt, aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        requestedPlanId = excluded.requestedPlanId,
        requestedPlanVersion = excluded.requestedPlanVersion,
        requestType = excluded.requestType,
        status = excluded.status,
        requestedBy = excluded.requestedBy,
        reviewedBy = excluded.reviewedBy,
        reviewedAt = excluded.reviewedAt,
        rejectionReason = excluded.rejectionReason,
        effectiveAt = excluded.effectiveAt,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_SUBSCRIPTION_REQUEST_FIND_BY_ID = `
    SELECT *
    FROM billing_subscription_requests
    WHERE id = ?;
`;

export const BILLING_SUBSCRIPTION_REQUEST_LIST = `
    SELECT *
    FROM billing_subscription_requests
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?;
`;

/* ================================================================ */
/* SUBSCRIPTION LEASES                                               */
/* ================================================================ */

export const BILLING_SUBSCRIPTION_LEASE_UPSERT = `
    INSERT INTO billing_subscription_leases (
        id, businessId, subscriptionId,
        branchId, deviceId,
        issuedAt, expiresAt, gracePeriodEnd,
        status, entitlementSnapshotJson,
        signedToken, revokedAt,
        aggregateVersion, lastEventId,
        createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        branchId = excluded.branchId,
        deviceId = excluded.deviceId,
        issuedAt = excluded.issuedAt,
        expiresAt = excluded.expiresAt,
        gracePeriodEnd = excluded.gracePeriodEnd,
        status = excluded.status,
        entitlementSnapshotJson = excluded.entitlementSnapshotJson,
        signedToken = excluded.signedToken,
        revokedAt = excluded.revokedAt,
        aggregateVersion = excluded.aggregateVersion,
        lastEventId = excluded.lastEventId,
        updatedAt = excluded.updatedAt;
`;

export const BILLING_SUBSCRIPTION_LEASE_FIND_BY_ID = `
    SELECT *
    FROM billing_subscription_leases
    WHERE id = ?;
`;

export const BILLING_SUBSCRIPTION_LEASE_FIND_BY_DEVICE = `
    SELECT *
    FROM billing_subscription_leases
    WHERE businessId = ?
      AND branchId IS ?
      AND deviceId = ?
      AND status = 'ACTIVE'
    ORDER BY issuedAt DESC
    LIMIT 1;
`;

export const BILLING_SUBSCRIPTION_LEASE_LIST = `
    SELECT *
    FROM billing_subscription_leases
    WHERE businessId = ?
      AND (? IS NULL OR status = ?)
    ORDER BY issuedAt DESC
    LIMIT ? OFFSET ?;
`;

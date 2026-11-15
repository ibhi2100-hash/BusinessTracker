
import type {
  BillingPlan,
  BillingPlanVersion,
  BillingSubscription,
  BillingEntitlement,
  BillingEntitlementOverride,
  BillingInvoice,
  BillingPayment,
  BillingSubscriptionRequest,
  BillingSubscriptionLease,
} from "../types";

/**
 * Converts Billing projection entities into positional SQLite parameters.
 *
 * IMPORTANT:
 * Each array must match the column order in its corresponding
 * SQL INSERT statement.
 */
export class BillingMapper {

  /* ============================================================
     PLAN
     ============================================================ */

  static planToInsert(
    state: BillingPlan
  ): unknown[] {
    return [
      state.id,
      state.code,
      state.name,
      state.description,
      state.status,
      state.displayOrder,
      state.isFeatured,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     PLAN VERSION
     ============================================================ */

  static planVersionToInsert(
    state: BillingPlanVersion
  ): unknown[] {
    return [
      state.id,
      state.planId,
      state.planVersion,
      state.priceMinor,
      state.currency,
      state.billingCycle,
      state.intervalCount,
      state.trialDays,
      state.maxStaff,
      state.maxBranch,
      state.maxProduct,
      state.featuresJson,
      state.publishedAt,
      state.createdAt,
    ];
  }

  /* ============================================================
     SUBSCRIPTION
     ============================================================ */

  static subscriptionToInsert(
    state: BillingSubscription
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.planId,
      state.planVersion,
      state.status,
      state.billingCycle,
      state.currency,
      state.priceMinor,
      state.trialStartsAt,
      state.trialEndsAt,
      state.currentPeriodStartsAt,
      state.currentPeriodEndsAt,
      state.gracePeriodEndsAt,
      state.cancelAtPeriodEnd,
      state.activatedAt,
      state.cancelledAt,
      state.expiredAt,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     EFFECTIVE ENTITLEMENT
     ============================================================ */

  static entitlementToInsert(
    state: BillingEntitlement
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.subscriptionId,
      state.entitlementKey,
      state.valueJson,
      state.source,
      state.status,
      state.validFrom,
      state.validUntil,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     ENTITLEMENT OVERRIDE
     ============================================================ */

  static entitlementOverrideToInsert(
    state: BillingEntitlementOverride
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.subscriptionId,
      state.entitlementKey,
      state.valueJson,
      state.status,
      state.reason,
      state.startsAt,
      state.expiresAt,
      state.createdBy,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     INVOICE
     ============================================================ */

  static invoiceToInsert(
    state: BillingInvoice
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.subscriptionId,
      state.invoiceNumber,
      state.status,
      state.currency,
      state.subtotalMinor,
      state.taxMinor,
      state.discountMinor,
      state.totalMinor,
      state.amountPaidMinor,
      state.amountDueMinor,
      state.periodStart,
      state.periodEnd,
      state.issuedAt,
      state.dueAt,
      state.paidAt,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     PAYMENT
     ============================================================ */

  static paymentToInsert(
    state: BillingPayment
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.subscriptionId,
      state.invoiceId,
      state.provider,
      state.providerReference,
      state.method,
      state.status,
      state.currency,
      state.amountMinor,
      state.refundedMinor,
      state.initiatedAt,
      state.confirmedAt,
      state.failedAt,
      state.reversedAt,
      state.refundedAt,
      state.failureReason,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     SUBSCRIPTION REQUEST
     ============================================================ */

  static subscriptionRequestToInsert(
    state: BillingSubscriptionRequest
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.requestedPlanId,
      state.requestedPlanVersion,
      state.requestType,
      state.status,
      state.requestedBy,
      state.reviewedBy,
      state.reviewedAt,
      state.rejectionReason,
      state.effectiveAt,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }

  /* ============================================================
     SUBSCRIPTION LEASE
     ============================================================ */

  static subscriptionLeaseToInsert(
    state: BillingSubscriptionLease
  ): unknown[] {
    return [
      state.id,
      state.businessId,
      state.subscriptionId,
      state.branchId,
      state.deviceId,
      state.issuedAt,
      state.expiresAt,
      state.gracePeriodEnd,
      state.status,
      state.entitlementSnapshotJson,
      state.signedToken,
      state.revokedAt,
      state.aggregateVersion,
      state.lastEventId,
      state.createdAt,
      state.updatedAt,
    ];
  }
}

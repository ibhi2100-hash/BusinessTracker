
import type {
  BillingSubscriptionRecord,
  BillingLeaseRecord,
  BillingEntitlementRecord,
} from "./billingplanApi";


export interface BillingLeaseClaims {
  leaseId: string;
  businessId: string;
  subscriptionId: string;
  branchId: string;
  deviceId: string;

  issuedAt: number;
  expiresAt: number;

  subscriptionVersion: number;
  entitlementVersion: number;

  entitlementSnapshot: Record<string, unknown>;
}
export type BillingAccessDecision =
  | "ALLOWED"
  | "TRIAL"
  | "GRACE"
  | "DENIED"
  | "LEASE_EXPIRED"
  | "LEASE_INVALID";

export interface BillingAccessContext {
  subscription: BillingSubscriptionRecord | null;
  lease: BillingLeaseRecord | null;
  entitlements: BillingEntitlementRecord[];
  serverTime: number;
  signatureValid: boolean;
}

export class BillingAccessService {

  evaluate(
    context: BillingAccessContext
  ): BillingAccessDecision {

    const {
      subscription,
      lease,
      entitlements,
      serverTime,
      signatureValid,
    } = context;

    if (!subscription) {
      return "DENIED";
    }

    if (!lease) {
      return "LEASE_INVALID";
    }

    if (!signatureValid) {
      return "LEASE_INVALID";
    }

    if (
      lease.businessId !== subscription.businessId
    ) {
      return "LEASE_INVALID";
    }

    if (lease.status !== "ACTIVE") {
      return "LEASE_INVALID";
    }

    if (serverTime >= lease.expiresAt) {
      return "LEASE_EXPIRED";
    }

    if (
      lease.gracePeriodEnd !== null &&
      serverTime > lease.gracePeriodEnd
    ) {
      return "LEASE_EXPIRED";
    }

    if (
      entitlements.some(
        entitlement =>
          entitlement.status === "REVOKED" &&
          entitlement.validUntil === null
      )
    ) {
      // Individual revoked entitlements must be checked
      // by entitlement key, not globally.
    }

    switch (subscription.status) {

      case "ACTIVE":
        return "ALLOWED";

      case "TRIALING":
        return "TRIAL";

      case "GRACE_PERIOD":
        return "GRACE";

      case "PAST_DUE":
        return subscription.gracePeriodEnd !== null &&
          serverTime < subscription.gracePeriodEnd
          ? "GRACE"
          : "DENIED";

      case "CANCELLED":
        return subscription.cancelAtPeriodEnd &&
          subscription.currentPeriodEnd !== null &&
          serverTime < subscription.currentPeriodEnd
          ? "ALLOWED"
          : "DENIED";

      default:
        return "DENIED";
    }
  }

  hasFeature(
    entitlements: BillingEntitlementRecord[],
    key: string,
    now: number
  ): boolean {

    const entitlement = entitlements.find(
      item => item.entitlementKey === key
    );

    if (!entitlement) return false;

    if (entitlement.status !== "ACTIVE") {
      return false;
    }

    if (now < entitlement.validFrom) {
      return false;
    }

    if (
      entitlement.validUntil !== null &&
      now >= entitlement.validUntil
    ) {
      return false;
    }

    return entitlement.valueJson === "true";
  }
}
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { BillingRequestStatus, BillingRequestType, BillingSubscriptionStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { BillingEntitlementService } from "./billing-entitlement.service.js"; 
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
interface CreateSubscriptionRequestInput {
  businessId: string;
  requestedPlanId: string;
  requestedPlanVersion: number;
  requestType: BillingRequestType;
  requestedBy: string;
  subscriptionId?: string;
  effectiveAt?: Date;
}

interface ApproveRequestInput {
  requestId: string;
  reviewerId: string;
  reason?: string;
}

export class BillingSubscriptionService {
  constructor(
    private readonly entitlementService: BillingEntitlementService,
  ) {}

  async createRequest(input: CreateSubscriptionRequestInput) {
    return prisma.$transaction(
      async (tx) => {
        const business = await tx.business.findUnique({
          where: { id: input.businessId },
          select: { id: true },
        });

        if (!business) throw new Error("Business not found");

        const planVersion = await tx.billingPlanVersion.findUnique({
          where: {
            planId_planVersion: {
              planId: input.requestedPlanId,
              planVersion: input.requestedPlanVersion,
            },
          },
          include: { plan: true },
        });

        if (!planVersion || planVersion.plan.status !== "PUBLISHED") {
          throw new Error("Requested plan version is not available");
        }

        if (input.subscriptionId) {
          const subscription = await tx.billingSubscription.findFirst({
            where: {
              id: input.subscriptionId,
              businessId: input.businessId,
            },
          });

          if (!subscription) {
            throw new Error("Subscription does not belong to this business");
          }
        }

        const pending = await tx.billingSubscriptionRequest.findFirst({
          where: {
            businessId: input.businessId,
            status: BillingRequestStatus.PENDING,
          },
        });

        if (pending) {
          throw new Error("This business already has a pending subscription request");
        }

        return tx.billingSubscriptionRequest.create({
          data: {
            id: crypto.randomUUID(),
            businessId: input.businessId,
            requestedPlanId: input.requestedPlanId,
            requestedPlanVersion: input.requestedPlanVersion,
            requestType: input.requestType,
            status: BillingRequestStatus.PENDING,
            requestedBy: input.requestedBy,
            subscriptionId: input.subscriptionId ?? null,
            effectiveAt: input.effectiveAt ?? null,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async approveRequest(input: ApproveRequestInput) {
    return prisma.$transaction(
      async (tx) => {
        const request = await tx.billingSubscriptionRequest.findUnique({
          where: { id: input.requestId },
        });

        if (!request) throw new Error("Subscription request not found");

        if (request.status !== BillingRequestStatus.PENDING) {
          throw new Error("Subscription request is no longer pending");
        }

        const planVersion = await tx.billingPlanVersion.findUnique({
          where: {
            planId_planVersion: {
              planId: request.requestedPlanId,
              planVersion: request.requestedPlanVersion,
            },
          },
          include: { plan: true },
        });

        if (!planVersion || planVersion.plan.status !== "PUBLISHED") {
          throw new Error("Requested plan version is no longer available");
        }

        const existingSubscription = request.subscriptionId
          ? await tx.billingSubscription.findFirst({
              where: {
                id: request.subscriptionId,
                businessId: request.businessId,
              },
            })
          : await tx.billingSubscription.findFirst({
              where: {
                businessId: request.businessId,
                status: {
                  in: [
                    BillingSubscriptionStatus.TRIALING,
                    BillingSubscriptionStatus.ACTIVE,
                    BillingSubscriptionStatus.PAST_DUE,
                    BillingSubscriptionStatus.GRACE_PERIOD,
                  ],
                },
              },
              orderBy: { createdAt: "desc" },
            });

        const now = new Date();

        let subscription;

        if (existingSubscription) {
          subscription = await tx.billingSubscription.update({
            where: { id: existingSubscription.id },
            data: {
              planId: request.requestedPlanId,
              planVersion: request.requestedPlanVersion,
              billingCycle: planVersion.billingCycle,
              currency: planVersion.currency,
              priceMinor: planVersion.priceMinor,
              status:
                existingSubscription.status === BillingSubscriptionStatus.PENDING
                  ? BillingSubscriptionStatus.PENDING
                  : existingSubscription.status,
              aggregateVersion: { increment: 1 },
            },
          });
        } else {
          subscription = await tx.billingSubscription.create({
            data: {
              id: crypto.randomUUID(),
              businessId: request.businessId,
              planId: request.requestedPlanId,
              planVersion: request.requestedPlanVersion,
              billingCycle: planVersion.billingCycle,
              currency: planVersion.currency,
              priceMinor: planVersion.priceMinor,
              status: BillingSubscriptionStatus.PENDING,
              currentPeriodStart: now,
              currentPeriodEnd: this.calculatePeriodEnd(
                now,
                planVersion.billingCycle,
                planVersion.intervalCount,
              ),
              aggregateVersion: 1,
            },
          });
        }

        await tx.billingSubscriptionRequest.update({
          where: { id: request.id },
          data: {
            status: BillingRequestStatus.APPROVED,
            reviewedBy: input.reviewerId,
            reviewedAt: now,
            rejectionReason: null,
            aggregateVersion: { increment: 1 },
          },
        });

        await tx.billingAuditLog.create({
          data: {
            id: crypto.randomUUID(),
            businessId: request.businessId,
            actorUserId: input.reviewerId,
            action: "APPROVED",
            entityType: "BillingSubscriptionRequest",
            entityId: request.id,
            reason: input.reason ?? "Subscription request approved",
            afterData: { subscriptionId: subscription.id },
          },
        });

        return subscription;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async rejectRequest(
    requestId: string,
    reviewerId: string,
    reason: string,
  ) {
    if (!reason.trim()) throw new Error("A rejection reason is required");

    return prisma.$transaction(async (tx) => {
      const request = await tx.billingSubscriptionRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) throw new Error("Subscription request not found");

      if (request.status !== BillingRequestStatus.PENDING) {
        throw new Error("Subscription request is no longer pending");
      }

      const updated = await tx.billingSubscriptionRequest.update({
        where: { id: requestId },
        data: {
          status: BillingRequestStatus.REJECTED,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reason.trim(),
          aggregateVersion: { increment: 1 },
        },
      });

      await tx.billingAuditLog.create({
        data: {
          id: crypto.randomUUID(),
          businessId: request.businessId,
          actorUserId: reviewerId,
          action: "REJECTED",
          entityType: "BillingSubscriptionRequest",
          entityId: request.id,
          reason: reason.trim(),
        },
      });

      return updated;
    });
  }

  async activateAfterVerifiedPayment(
    subscriptionId: string,
    verifiedPaymentId: string,
  ) {
    return prisma.$transaction(
      async (tx) => {
        const subscription = await tx.billingSubscription.findUnique({
          where: { id: subscriptionId },
        });

        if (!subscription) throw new Error("Subscription not found");

        const payment = await tx.billingPayment.findFirst({
          where: {
            id: verifiedPaymentId,
            businessId: subscription.businessId,
            subscriptionId,
            status: "CONFIRMED",
          },
        });

        if (!payment) {
          throw new Error("A verified, confirmed payment is required");
        }

        if (
          subscription.status !== BillingSubscriptionStatus.PENDING &&
          subscription.status !== BillingSubscriptionStatus.PAST_DUE
        ) {
          throw new Error("Subscription cannot be activated from its current state");
        }

        const now = new Date();

        const updated = await tx.billingSubscription.update({
          where: { id: subscriptionId },
          data: {
            status: BillingSubscriptionStatus.ACTIVE,
            activatedAt: subscription.activatedAt ?? now,
            currentPeriodStart: now,
            currentPeriodEnd: this.calculatePeriodEnd(
              now,
              subscription.billingCycle,
              1,
            ),
            aggregateVersion: { increment: 1 },
          },
        });

        await this.entitlementService.rebuildForBusiness(
          subscription.businessId,
          tx,
        );

        await tx.billingAuditLog.create({
          data: {
            id: crypto.randomUUID(),
            businessId: subscription.businessId,
            action: "ACTIVATED",
            entityType: "BillingSubscription",
            entityId: subscription.id,
            reason: "Activated following verified payment",
            afterData: { verifiedPaymentId },
          },
        });

        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async cancelAtPeriodEnd(subscriptionId: string, businessId: string) {
    const subscription = await prisma.billingSubscription.findFirst({
      where: { id: subscriptionId, businessId },
    });

    if (!subscription) throw new Error("Subscription not found");

    if (
      ![
        BillingSubscriptionStatus.ACTIVE,
        BillingSubscriptionStatus.TRIALING,
        BillingSubscriptionStatus.PAST_DUE,
        BillingSubscriptionStatus.GRACE_PERIOD,
      ].includes(subscription.status)
    ) {
      throw new Error("Subscription cannot be scheduled for cancellation");
    }

    return prisma.billingSubscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        aggregateVersion: { increment: 1 },
      },
    });
  }

  async expireSubscription(subscriptionId: string, reason = "Period ended") {
    return prisma.$transaction(async (tx) => {
      const subscription = await tx.billingSubscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) throw new Error("Subscription not found");

      if (
        ![
          BillingSubscriptionStatus.ACTIVE,
          BillingSubscriptionStatus.GRACE_PERIOD,
          BillingSubscriptionStatus.PAST_DUE,
        ].includes(subscription.status)
      ) {
        return subscription;
      }

      const now = new Date();

      const updated = await tx.billingSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: BillingSubscriptionStatus.EXPIRED,
          expiredAt: now,
          aggregateVersion: { increment: 1 },
        },
      });

      await this.entitlementService.rebuildForBusiness(
        subscription.businessId,
        tx,
      );

      await tx.billingAuditLog.create({
        data: {
          id: crypto.randomUUID(),
          businessId: subscription.businessId,
          action: "CANCELLED",
          entityType: "BillingSubscription",
          entityId: subscription.id,
          reason,
        },
      });

      return updated;
    });
  }

  async getCurrentSubscription(businessId: string) {
    return prisma.billingSubscription.findFirst({
      where: {
        businessId,
        status: {
          in: [
            BillingSubscriptionStatus.PENDING,
            BillingSubscriptionStatus.TRIALING,
            BillingSubscriptionStatus.ACTIVE,
            BillingSubscriptionStatus.PAST_DUE,
            BillingSubscriptionStatus.GRACE_PERIOD,
            BillingSubscriptionStatus.SUSPENDED,
          ],
        },
      },
      include: {
        planVersionRecord: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  private calculatePeriodEnd(
    start: Date,
    cycle: string,
    intervalCount: number,
  ) {
    const end = new Date(start);
    const interval = Math.max(1, intervalCount || 1);

    switch (cycle) {
      case "MONTHLY":
        end.setMonth(end.getMonth() + interval);
        break;
      case "QUARTERLY":
        end.setMonth(end.getMonth() + 3 * interval);
        break;
      case "YEARLY":
        end.setFullYear(end.getFullYear() + interval);
        break;
      case "LIFETIME":
        end.setFullYear(end.getFullYear() + 100);
        break;
      default:
        throw new Error(`Unsupported billing cycle: ${cycle}`);
    }

    return end;
  }
}

import {
  BillingSubscriptionStatus,
  Prisma,
  PrismaClient,
} from "../../generated/client";

import { BillingEntitlementService } from "./billing-entitlement.service";
import { BillingLeaseService } from "./billing-lease.service";

interface ActivateBusinessInput {
  businessId: string;
  userId: string;
  deviceId: string;
  branchId?: string;
}

export class BillingActivationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly entitlements: BillingEntitlementService,
    private readonly leases: BillingLeaseService,
  ) {}

  async activate(input: ActivateBusinessInput) {
    return this.prisma.$transaction(
      async (tx) => {
        const business = await tx.business.findUnique({
          where: { id: input.businessId },
        });

        if (!business) throw new Error("Business not found");

        if (business.userId !== input.userId) {
          throw new Error("User is not authorized to activate this business");
        }

        if (business.status === "ACTIVE") {
          throw new Error("Business is already active");
        }

        if (business.status === "SUSPENDED") {
          throw new Error("Suspended businesses cannot be activated");
        }

        const subscription = await tx.billingSubscription.findFirst({
          where: {
            businessId: input.businessId,
            status: {
              in: [
                BillingSubscriptionStatus.ACTIVE,
                BillingSubscriptionStatus.TRIALING,
              ],
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!subscription) {
          throw new Error("An active or trialing subscription is required");
        }

        const now = new Date();

        if (
          subscription.currentPeriodEnd &&
          subscription.currentPeriodEnd <= now
        ) {
          throw new Error("Subscription period has expired");
        }

        const entitlementRows = await tx.billingEntitlement.findMany({
          where: {
            businessId: input.businessId,
            status: "ACTIVE",
            validFrom: { lte: now },
            OR: [{ validUntil: null }, { validUntil: { gt: now } }],
          },
        });

        const entitlementMap = Object.fromEntries(
          entitlementRows.map((row) => [row.entitlementKey, row.value]),
        );

        const maxBranches = Number(entitlementMap.max_branches);
        const maxProducts = Number(entitlementMap.max_products);

        if (!Number.isFinite(maxBranches) || !Number.isFinite(maxProducts)) {
          throw new Error("Required capacity entitlements are missing");
        }

        const [activeBranches, activeProducts, activeStaff] =
          await Promise.all([
            tx.branch.count({
              where: {
                businessId: input.businessId,
                isActive: true,
              },
            }),
            tx.product.count({
              where: {
                businessId: input.businessId,
                isActive: true,
                isDeleted: false,
              },
            }),
            tx.employee.count({
              where: {
                businessId: input.businessId,
                employmentStatus: "ACTIVE",
              },
            }),
          ]);

        const maxStaff = Number(entitlementMap.max_staff);

        if (!Number.isFinite(maxStaff)) {
          throw new Error("Staff capacity entitlement is missing");
        }

        if (activeBranches > maxBranches) {
          throw new Error("Business exceeds its branch entitlement");
        }

        if (activeProducts > maxProducts) {
          throw new Error("Business exceeds its product entitlement");
        }

        if (activeStaff > maxStaff) {
          throw new Error("Business exceeds its staff entitlement");
        }

        if (input.branchId) {
          const branch = await tx.branch.findFirst({
            where: {
              id: input.branchId,
              businessId: input.businessId,
              isActive: true,
            },
          });

          if (!branch) throw new Error("Selected branch is invalid");
        }

        // Opening working capital must be recorded in the financial ledger
        // before activation. Replace this check with your actual ledger model.
        const openingCapitalRecord = await tx.business.findFirst({
          where: {
            id: input.businessId,
            onboardingCompleted: true,
          },
          select: { id: true },
        });

        if (!openingCapitalRecord) {
          throw new Error("Business onboarding has not been completed");
        }

        const updatedBusiness = await tx.business.update({
          where: { id: input.businessId },
          data: {
            status: "ACTIVE",
            onboardingCompleted: true,
            activatedAt: now,
          },
        });

        await tx.billingAuditLog.create({
          data: {
            businessId: input.businessId,
            actorUserId: input.userId,
            action: "ACTIVATED",
            entityType: "Business",
            entityId: input.businessId,
            reason: "Business activation completed",
            afterData: {
              subscriptionId: subscription.id,
              activeBranches,
              activeProducts,
              activeStaff,
            },
          },
        });

        return {
          business: updatedBusiness,
          subscriptionId: subscription.id,
          deviceId: input.deviceId,
          branchId: input.branchId ?? null,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ).then(async (result) => {
      // Lease issuance is deliberately outside the activation transaction
      // because the lease service signs and persists a separate artifact.
      const lease = await this.leases.issue({
        businessId: input.businessId,
        subscriptionId: result.subscriptionId,
        deviceId: input.deviceId,
        branchId: input.branchId,
      });

      return {
        business: result.business,
        lease,
      };
    });
  }
}

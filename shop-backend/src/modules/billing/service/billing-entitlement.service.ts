import { BillingEntitlementSource, BillingRecordStatus, BillingSubscriptionStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { BillingEntitlementOverrideRepository } from "../repositories/billing-entitlement-override.repository.js";
import { BillingEntitlementRepository } from "../repositories/billing-entitlement.repository.js";
type JsonObject = Record<string, Prisma.InputJsonValue>;

type CapacityKey = "max_staff" | "max_branches" | "max_products";

interface CapacityCheck {
  businessId: string;
  key: CapacityKey;
  currentCount: number;
  additional?: number;
}

interface CreateOverrideInput {
  businessId: string;
  subscriptionId?: string;
  entitlementKey: string;
  value: Prisma.InputJsonValue;
  reason: string;
  createdBy: string;
  startsAt?: Date;
  expiresAt?: Date;
}

const CAPACITY_KEYS: CapacityKey[] = [
  "max_staff",
  "max_branches",
  "max_products",
];

function isObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeFeatures(value: Prisma.JsonValue): JsonObject {
  if (!isObject(value)) return {};

  const result: JsonObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (item === null) continue;
    result[key] = item as Prisma.InputJsonValue;
  }

  return result;
}

function toLimit(value: Prisma.JsonValue | undefined): number | null {
  if (value === undefined || value === null) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export class BillingEntitlementService {
  constructor(
    private readonly entitlementOverrideRepository: 
      BillingEntitlementOverrideRepository,
    private readonly entitlementRepository: 
      BillingEntitlementRepository
  ){}
  /**
   * Rebuilds the business entitlement projection from:
   * 1. The current subscription's exact plan version.
   * 2. Active overrides.
   *
   * The caller should invoke this inside the same transaction as a
   * subscription activation, upgrade, downgrade, or renewal.
   */
  async rebuildForBusiness(
    businessId: string,
    tx: Prisma.TransactionClient
  ) {
    const now = new Date();

    const subscription = await tx.billingSubscription.findFirst({
      where: {
        businessId,
        status: {
          in: [
            BillingSubscriptionStatus.TRIALING,
            BillingSubscriptionStatus.ACTIVE,
            BillingSubscriptionStatus.PAST_DUE,
            BillingSubscriptionStatus.GRACE_PERIOD,
          ],
        },
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        planVersionRecord: true,
      },
    });

    const planValues: JsonObject = {};

    if (subscription?.planVersionRecord) {
      const version = subscription.planVersionRecord;

      planValues.max_staff = version.maxStaff;
      planValues.max_branches = version.maxBranch;
      planValues.max_products = version.maxProduct;

      Object.assign(
        planValues,
        normalizeFeatures(version.features),
      );
    }

    const activeOverrides = await tx.billingEntitlementOverride.findMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        ...(subscription
          ? {
              OR: [
                { subscriptionId: subscription.id },
                { subscriptionId: null },
              ],
            }
          : { subscriptionId: null }),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    // Later-created overrides replace earlier overrides for the same key.
    const effectiveValues: JsonObject = { ...planValues };

    for (const override of activeOverrides) {
      effectiveValues[override.entitlementKey] =
        override.value as Prisma.InputJsonValue;
    }

    const validUntil = subscription?.currentPeriodEnd ?? null;

    for (const [entitlementKey, value] of Object.entries(effectiveValues)) {
      await tx.billingEntitlement.upsert({
        where: {
          businessId_entitlementKey: {
            businessId,
            entitlementKey,
          },
        },
        create: {
          id: crypto.randomUUID(),
          businessId,
          subscriptionId: subscription?.id ?? null,
          entitlementKey,
          value,
          source: activeOverrides.some(
            (item) => item.entitlementKey === entitlementKey,
          )
            ? BillingEntitlementSource.OVERRIDE
            : BillingEntitlementSource.PLAN,
          status: BillingRecordStatus.ACTIVE,
          validFrom: now,
          validUntil,
        },
        update: {
          subscriptionId: subscription?.id ?? null,
          value,
          source: activeOverrides.some(
            (item) => item.entitlementKey === entitlementKey,
          )
            ? BillingEntitlementSource.OVERRIDE
            : BillingEntitlementSource.PLAN,
          status: BillingRecordStatus.ACTIVE,
          validFrom: now,
          validUntil,
        },
      });
    }

    // Revoke stale projection keys no longer supplied by the plan or overrides.
    const effectiveKeys = Object.keys(effectiveValues);

    await tx.billingEntitlement.updateMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        ...(effectiveKeys.length
          ? { entitlementKey: { notIn: effectiveKeys } }
          : {}),
      },
      data: {
        status: BillingRecordStatus.REVOKED,
        validUntil: now,
      },
    });

    return {
      businessId,
      subscriptionId: subscription?.id ?? null,
      entitlements: effectiveValues,
      rebuiltAt: now,
    };
  }

  async getEffectiveEntitlements(businessId: string) {
    const now = new Date();

    const records = await prisma.billingEntitlement.findMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        validFrom: { lte: now },
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
      orderBy: [{ entitlementKey: "asc" }],
    });

    const values: Record<string, Prisma.JsonValue> = {};

    for (const record of records) {
      values[record.entitlementKey] = record.value;
    }

    return values;
  }

  async getEntitlement(businessId: string, key: string) {
    const values = await this.getEffectiveEntitlements(businessId);
    return values[key] ?? null;
  }

  /**
   * The caller must supply a count obtained from an authoritative database
   * query in the same business scope. Do not use a client-supplied count.
   */
  async assertWithinLimit(input: CapacityCheck) {
    const { businessId, key, currentCount } = input;
    const additional = input.additional ?? 1;

    if (!Number.isInteger(currentCount) || currentCount < 0) {
      throw new Error("currentCount must be a non-negative integer");
    }

    if (!Number.isInteger(additional) || additional < 0) {
      throw new Error("additional must be a non-negative integer");
    }

    const values = await this.getEffectiveEntitlements(businessId);
    const rawLimit = values[key];
    const limit = toLimit(rawLimit);

    // A missing or non-numeric limit is treated as unconfigured, not unlimited.
    if (limit === null) {
      throw new Error(`Billing entitlement "${key}" is not configured`);
    }

    if (currentCount + additional > limit) {
      throw new Error(
        `Capacity limit reached for ${key}. Limit: ${limit}; current: ${currentCount}; requested: ${additional}`,
      );
    }

    return {
      allowed: true,
      key,
      limit,
      currentCount,
      additional,
      remaining: Math.max(0, limit - currentCount - additional),
    };
  }

  async assertCanAddStaff(
    businessId: string,
    currentActiveStaffCount: number,
    additional = 1,
  ) {
    return this.assertWithinLimit({
      businessId,
      key: "max_staff",
      currentCount: currentActiveStaffCount,
      additional,
    });
  }

  async assertCanAddBranch(
    businessId: string,
    currentActiveBranchCount: number,
    additional = 1,
  ) {
    return this.assertWithinLimit({
      businessId,
      key: "max_branches",
      currentCount: currentActiveBranchCount,
      additional,
    });
  }

  async assertCanAddProduct(
    businessId: string,
    currentActiveProductCount: number,
    additional = 1,
  ) {
    return this.assertWithinLimit({
      businessId,
      key: "max_products",
      currentCount: currentActiveProductCount,
      additional,
    });
  }

  async createOverride(input: CreateOverrideInput) {
    if (!input.reason.trim()) {
      throw new Error("An override reason is required");
    }

    if (
      input.startsAt &&
      input.expiresAt &&
      input.expiresAt <= input.startsAt
    ) {
      throw new Error("Override expiry must be later than its start time");
    }

    return prisma.$transaction(async (tx) => {
      const business = await tx.business.findUnique({
        where: { id: input.businessId },
        select: { id: true },
      });

      if (!business) throw new Error("Business not found");

      if (input.subscriptionId) {
        const subscription = await tx.billingSubscription.findFirst({
          where: {
            id: input.subscriptionId,
            businessId: input.businessId,
          },
          select: { id: true },
        });

        if (!subscription) {
          throw new Error("Subscription does not belong to this business");
        }
      }

      const override = await tx.billingEntitlementOverride.create({
        data: {
          id: crypto.randomUUID(),
          businessId: input.businessId,
          subscriptionId: input.subscriptionId ?? null,
          entitlementKey: input.entitlementKey,
          value: input.value,
          status: BillingRecordStatus.ACTIVE,
          reason: input.reason.trim(),
          createdBy: input.createdBy,
          startsAt: input.startsAt ?? new Date(),
          expiresAt: input.expiresAt ?? null,
        },
      });

      await this.rebuildForBusiness(input.businessId, tx);

      await tx.billingAuditLog.create({
        data: {
          id: crypto.randomUUID(),
          businessId: input.businessId,
          actorUserId: input.createdBy,
          action: "OVERRIDE_GRANTED",
          entityType: "BillingEntitlementOverride",
          entityId: override.id,
          reason: input.reason.trim(),
          afterData: {
            entitlementKey: input.entitlementKey,
            value: input.value,
            expiresAt: input.expiresAt?.toISOString() ?? null,
          },
        },
      });

      return override;
    });
  }

  async revokeOverride(
    overrideId: string,
    actorUserId: string,
    reason: string,
  ) {
    if (!reason.trim()) {
      throw new Error("A revocation reason is required");
    }

    return prisma.$transaction(async (tx) => {
      const override = await tx.billingEntitlementOverride.findUnique({
        where: { id: overrideId },
      });

      if (!override) throw new Error("Entitlement override not found");

      const updated = await tx.billingEntitlementOverride.update({
        where: { id: overrideId },
        data: {
          status: BillingRecordStatus.REVOKED,
        },
      });

      await this.rebuildForBusiness(override.businessId, tx);

      await tx.billingAuditLog.create({
        data: {
          id: crypto.randomUUID(),
          businessId: override.businessId,
          actorUserId,
          action: "OVERRIDE_REVOKED",
          entityType: "BillingEntitlementOverride",
          entityId: override.id,
          reason: reason.trim(),
          beforeData: {
            entitlementKey: override.entitlementKey,
            value: override.value,
          },
        },
      });

      return updated;
    });
  }
}

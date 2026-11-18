
import { BillingRecordStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class BillingEntitlementOverrideRepository {
  async create(
    data: Prisma.BillingEntitlementOverrideCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlementOverride.create({ data });
  }

  async findById(id: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlementOverride.findUnique({
      where: { id },
    });
  }

  async findByBusinessId(
    businessId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlementOverride.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByBusinessId(
    businessId: string,
    now = new Date(),
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlementOverride.findMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByKey(
    businessId: string,
    entitlementKey: string,
    now = new Date(),
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlementOverride.findMany({
      where: {
        businessId,
        entitlementKey,
        status: BillingRecordStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingEntitlementOverrideUpdateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlementOverride.update({
      where: { id },
      data,
    });
  }

  async revoke(id: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlementOverride.update({
      where: { id },
      data: {
        status: BillingRecordStatus.REVOKED,
        expiresAt: new Date(),
      },
    });
  }

  async findExpired(now = new Date(), take = 100) {
    return prisma.billingEntitlementOverride.findMany({
      where: {
        status: BillingRecordStatus.ACTIVE,
        expiresAt: { lte: now },
      },
      take,
      orderBy: { expiresAt: "asc" },
    });
  }

  async countActiveByBusinessId(
    businessId: string,
    now = new Date()
  ) {
    return prisma.billingEntitlementOverride.count({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        startsAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
    });
  }
}

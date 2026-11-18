
import { BillingLeaseStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient

export class BillingLeaseRepository {

  async create(
    data: Prisma.BillingSubscriptionLeaseCreateInput,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingSubscriptionLease.findUnique({
      where: { id },
      include: { subscription: true },
    });
  }

  async findByDeviceId(
    businessId: string,
    deviceId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.findMany({
      where: { businessId, deviceId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findByBranchId(
    businessId: string,
    branchId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.findMany({
      where: { businessId, branchId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findActiveForDevice(
    businessId: string,
    deviceId: string,
    now = new Date(),
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.findFirst({
      where: {
        businessId,
        deviceId,
        status: BillingLeaseStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findBySubscriptionId(
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.findMany({
      where: { subscriptionId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingSubscriptionLeaseUpdateInput,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.update({
      where: { id },
      data,
    });
  }

  async revoke(id: string, tx: DbClient) {
    return tx.billingSubscriptionLease.update({
      where: { id },
      data: {
        status: BillingLeaseStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeBySubscriptionId(
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.updateMany({
      where: {
        subscriptionId,
        status: BillingLeaseStatus.ACTIVE,
      },
      data: {
        status: BillingLeaseStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeByDeviceId(
    businessId: string,
    deviceId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionLease.updateMany({
      where: {
        businessId,
        deviceId,
        status: BillingLeaseStatus.ACTIVE,
      },
      data: {
        status: BillingLeaseStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async findExpired(now = new Date(), take = 100) {
    return prisma.billingSubscriptionLease.findMany({
      where: {
        status: BillingLeaseStatus.ACTIVE,
        expiresAt: { lte: now },
      },
      take,
      orderBy: { expiresAt: "asc" },
    });
  }

  async markExpired(id: string, tx: DbClient) {
    return tx.billingSubscriptionLease.update({
      where: { id },
      data: {
        status: BillingLeaseStatus.EXPIRED,
      },
    });
  }

  async countActiveByBusinessId(
    businessId: string,
    now = new Date()
  ) {
    return prisma.billingSubscriptionLease.count({
      where: {
        businessId,
        status: BillingLeaseStatus.ACTIVE,
        expiresAt: { gt: now },
      },
    });
  }
}

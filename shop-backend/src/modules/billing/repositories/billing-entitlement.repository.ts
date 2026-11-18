import { randomUUID } from "node:crypto";
import { BillingEntitlementSource, BillingRecordStatus } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class BillingEntitlementRepository {

  async create(
    data: Prisma.BillingEntitlementCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlement.create({ data });
  }

  async findById(id: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlement.findUnique({
      where: { id },
    });
  }

  async findByBusinessId(businessId: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlement.findMany({
      where: { businessId },
      orderBy: { entitlementKey: "asc" },
    });
  }

  async findEffectiveByBusinessId(
    businessId: string,
    now = new Date(),
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlement.findMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gt: now } },
        ],
      },
    });
  }

  async findByKey(
    businessId: string,
    entitlementKey: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlement.findUnique({
      where: {
        businessId_entitlementKey: {
          businessId,
          entitlementKey,
        },
      },
    });
  }

  async upsert(
    businessId: string,
    entitlementKey: string,
    data: {
      value: Prisma.InputJsonValue;
      source: BillingEntitlementSource;
      subscriptionId?: string | null;
      validFrom?: Date;
      validUntil?: Date | null;
      status?: BillingRecordStatus;
    },
    tx: Prisma.TransactionClient
  ) {
    const createData = {
      id: randomUUID(),
      business: { connect: { id: businessId } },
      entitlementKey,
      value: data.value,
      source: data.source,
      status: data.status ?? BillingRecordStatus.ACTIVE,
      validFrom: data.validFrom ?? new Date(),
      validUntil: data.validUntil ?? null,
      ...(data.subscriptionId
        ? { subscription: { connect: { id: data.subscriptionId } } }
        : {}),
    };

    const updateData: Prisma.BillingEntitlementUpdateInput = {
      value: data.value,
      source: data.source,
      status: data.status ?? BillingRecordStatus.ACTIVE,
      validFrom: data.validFrom ?? new Date(),
      validUntil: data.validUntil ?? null,
      subscription: data.subscriptionId
        ? { connect: { id: data.subscriptionId } }
        : { disconnect: true },
    };

    return tx.billingEntitlement.upsert({
      where: {
        businessId_entitlementKey: {
          businessId,
          entitlementKey,
        },
      },
      create: createData,
      update: updateData,
    });
  }

  async update(
    id: string,
    data: Prisma.BillingEntitlementUpdateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlement.update({
      where: { id },
      data,
    });
  }

  async revoke(id: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlement.update({
      where: { id },
      data: {
        status: BillingRecordStatus.REVOKED,
        validUntil: new Date(),
      },
    });
  }

  async revokeByBusinessId(
    businessId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingEntitlement.updateMany({
      where: {
        businessId,
        status: BillingRecordStatus.ACTIVE,
      },
      data: {
        status: BillingRecordStatus.REVOKED,
        validUntil: new Date(),
      },
    });
  }

  async findExpired(now = new Date(), take = 100) {
    return prisma.billingEntitlement.findMany({
      where: {
        status: BillingRecordStatus.ACTIVE,
        validUntil: { lte: now },
      },
      take,
      orderBy: { validUntil: "asc" },
    });
  }

  async delete(id: string, tx: Prisma.TransactionClient) {
    return tx.billingEntitlement.delete({
      where: { id },
    });
  }
}

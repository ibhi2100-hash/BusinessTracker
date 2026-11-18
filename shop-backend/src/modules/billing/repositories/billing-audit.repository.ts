
import { BillingAuditAction } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


export class BillingAuditRepository {
  async create(
    data: Prisma.BillingAuditLogCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingAuditLog.create({ data });
  }

  async findById(id: string, tx: Prisma.TransactionClient) {
    return tx.billingAuditLog.findUnique({
      where: { id },
    });
  }

  async findByBusinessId(
    businessId: string,
    params?: {
      action?: BillingAuditAction;
      entityType?: string;
      entityId?: string;
      skip?: number;
      take?: number;
    }
  ) {
    const {
      action,
      entityType,
      entityId,
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.billingAuditLog.findMany({
      where: {
        businessId,
        ...(action ? { action } : {}),
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    take = 50
  ) {
    return prisma.billingAuditLog.findMany({
      where: { entityType, entityId },
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async findByActor(
    actorUserId: string,
    params?: {
      skip?: number;
      take?: number;
    }
  ) {
    const { skip = 0, take = 50 } = params ?? {};

    return prisma.billingAuditLog.findMany({
      where: { actorUserId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async countByBusinessId(businessId: string) {
    return prisma.billingAuditLog.count({
      where: { businessId },
    });
  }
}

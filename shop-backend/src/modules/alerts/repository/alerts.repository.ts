import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { AlertType, Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class AlertRepository {
  /**
   * Create new alert
   */
  async create(data: Prisma.AlertCreateInput) {
    return prisma.alert.create({
      data,
    });
  }

  /**
   * Prevent duplicate unresolved alerts
   */
  async findExisting(
  businessId: string,
  branchId: string,
  type: AlertType,
  metadata?: Prisma.JsonObject
) {
  return prisma.alert.findFirst({
    where: {
      businessId,
      branchId,
      type,
      isResolved: false,
      ...(metadata !== undefined && {
        metadata: { equals: metadata },
      }),
    },
  });
}

  /**
   * Fetch alerts for a branch
   */
  async findByBranch(businessId: string, branchId: string) {
    return prisma.alert.findMany({
      where: {
        businessId,
        branchId,
        isResolved: false,
      },
      orderBy: [
        { severity: "desc" }, // CRITICAL first
        { createdAt: "desc" },
      ],
      take: 20,
    });
  }

  /**
   * Fetch all alerts across business (owner dashboard)
   */
  async findBusinessAlerts(businessId: string) {
    return prisma.alert.findMany({
      where: {
        businessId,
        isResolved: false,
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });
  }

  /**
   * Mark alert as read
   */
  async markRead(id: string) {
    return prisma.alert.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Resolve alert manually
   */
  async resolve(id: string) {
    return prisma.alert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Resolve alerts by type + metadata
   * (used when condition is fixed e.g. restock)
   */
  async resolveByType(
    branchId: string,
    type: AlertType,
    referenceId?: string
  ) {
    return prisma.alert.updateMany({
      where: {
        branchId,
        type,
        isResolved: false,
        ...(referenceId && {
          metadata: {
            path: ["productId"],
            equals: referenceId,
          },
        }),
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Count unread alerts (for badges)
   */
  async countUnread(branchId: string) {
    return prisma.alert.count({
      where: {
        branchId,
        isRead: false,
        isResolved: false,
      },
    });
  }

  /**
   * Delete old resolved alerts (cleanup job)
   */
  async deleteOldResolved(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return prisma.alert.deleteMany({
      where: {
        isResolved: true,
        resolvedAt: {
          lt: cutoff,
        },
      },
    });
  }
}
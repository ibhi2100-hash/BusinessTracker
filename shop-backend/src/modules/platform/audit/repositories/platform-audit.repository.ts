import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient;

export interface CreatePlatformAuditLogInput {
  actorPlatformUserId?: string | null;

  action: string;

  resourceType: string;
  resourceId?: string | null;

  targetBusinessId?: string | null;

  reason?: string | null;

  beforeData?: Prisma.InputJsonValue | null;
  afterData?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;

  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
}

export interface PlatformAuditListParams {
  actorPlatformUserId?: string;
  targetBusinessId?: string;

  action?: string;
  resourceType?: string;
  resourceId?: string;

  correlationId?: string;

  from?: Date;
  to?: Date;

  skip?: number;
  take?: number;
}

export class PlatformAuditRepository {
  /**
   * Create an audit record.
   *
   * A transaction client is mandatory. This ensures that
   * the audit record can be committed atomically with
   * the administrative operation it describes.
   */
  async create(
    data: CreatePlatformAuditLogInput,
    tx: DbClient
  ) {
    return tx.platformAuditLog.create({
      data: {
        actorPlatformUserId: data.actorPlatformUserId ?? null,

        action: data.action,

        resourceType: data.resourceType,
        resourceId: data.resourceId ?? null,

        targetBusinessId: data.targetBusinessId ?? null,

        reason: data.reason ?? null,

        beforeData: data.beforeData ?? Prisma.JsonNull,
        afterData: data.afterData ?? Prisma.JsonNull,
        metadata: data.metadata ?? Prisma.JsonNull,

        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        correlationId: data.correlationId ?? null,
      },
    });
  }

  /**
   * Find one audit record by ID.
   */
  async findById(id: string) {
    return prisma.platformAuditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve platform audit records.
   *
   * Results are ordered newest first.
   */
  async findMany(params: PlatformAuditListParams = {}) {
    const {
      actorPlatformUserId,
      targetBusinessId,
      action,
      resourceType,
      resourceId,
      correlationId,
      from,
      to,
      skip = 0,
      take = 50,
    } = params;

    return prisma.platformAuditLog.findMany({
      where: {
        ...(actorPlatformUserId
          ? { actorPlatformUserId }
          : {}),

        ...(targetBusinessId
          ? { targetBusinessId }
          : {}),

        ...(action ? { action } : {}),

        ...(resourceType ? { resourceType } : {}),

        ...(resourceId ? { resourceId } : {}),

        ...(correlationId ? { correlationId } : {}),

        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Count audit records matching the filters.
   */
  async count(params: PlatformAuditListParams = {}) {
    const {
      actorPlatformUserId,
      targetBusinessId,
      action,
      resourceType,
      resourceId,
      correlationId,
      from,
      to,
    } = params;

    return prisma.platformAuditLog.count({
      where: {
        ...(actorPlatformUserId
          ? { actorPlatformUserId }
          : {}),

        ...(targetBusinessId
          ? { targetBusinessId }
          : {}),

        ...(action ? { action } : {}),

        ...(resourceType ? { resourceType } : {}),

        ...(resourceId ? { resourceId } : {}),

        ...(correlationId ? { correlationId } : {}),

        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
    });
  }

  /**
   * Retrieve the activity history of a specific resource.
   */
  async findByResource(
    resourceType: string,
    resourceId: string,
    params?: {
      skip?: number;
      take?: number;
    }
  ) {
    const {
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.platformAuditLog.findMany({
      where: {
        resourceType,
        resourceId,
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve all recorded activity affecting one tenant.
   */
  async findByBusinessId(
    businessId: string,
    params?: {
      skip?: number;
      take?: number;
    }
  ) {
    const {
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.platformAuditLog.findMany({
      where: {
        targetBusinessId: businessId,
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Retrieve activity performed by a platform administrator.
   */
  async findByActor(
    platformUserId: string,
    params?: {
      skip?: number;
      take?: number;
    }
  ) {
    const {
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.platformAuditLog.findMany({
      where: {
        actorPlatformUserId: platformUserId,
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Retrieve records sharing a request correlation ID.
   */
  async findByCorrelationId(correlationId: string) {
    return prisma.platformAuditLog.findMany({
      where: { correlationId },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

import {
  BillingPlanStatus,
} from "../../../infrastructure/postgresql/prisma/generated/enums.js";

import {
  Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
  prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";

/**
 * A database client can either be the shared Prisma client
 * or a transaction-scoped Prisma client.
 */
type BillingPlanDbClient =
  | typeof prisma
  | Prisma.TransactionClient;

export class BillingPlanRepository {
  private getClient(
    tx?: Prisma.TransactionClient
  ): BillingPlanDbClient {
    return tx ?? prisma;
  }

  /**
   * Create a billing plan.
   */
  async create(
    data: Prisma.BillingPlanCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.create({
      data,
    });
  }

  /**
   * Find a billing plan by ID, including its version history.
   */
  async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: {
            planVersion: "desc",
          },
        },
      },
    });
  }

  /**
   * Find a billing plan by its unique code.
   */
  async findByCode(
    code: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.findUnique({
      where: { code },
    });
  }

  /**
   * Find the latest version, whether published or unpublished.
   */
  async findLatestVersion(
    planId: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlanVersion.findFirst({
      where: { planId },
      orderBy: {
        planVersion: "desc",
      },
    });
  }

  /**
   * Find the latest published version.
   */
  async findLatestPublishedVersion(
    planId: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlanVersion.findFirst({
      where: {
        planId,
        publishedAt: {
          not: null,
        },
      },
      orderBy: {
        planVersion: "desc",
      },
    });
  }

  /**
   * Find a specific version.
   */
  async findVersion(
    planId: string,
    planVersion: number,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlanVersion.findUnique({
      where: {
        planId_planVersion: {
          planId,
          planVersion,
        },
      },
    });
  }

  /**
   * List plans with pagination and optional filters.
   */
  async findMany(
    params?: {
      status?: BillingPlanStatus;
      search?: string;
      skip?: number;
      take?: number;
    },
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    const {
      status,
      search,
      skip = 0,
      take = 20,
    } = params ?? {};

    const normalizedSearch = search?.trim();

    const where: Prisma.BillingPlanWhereInput = {
      ...(status ? { status } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    return db.billingPlan.findMany({
      where,
      skip,
      take,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        versions: {
          orderBy: {
            planVersion: "desc",
          },
        },
      },
    });
  }

  /**
   * Update billing plan metadata or lifecycle status.
   *
   * Pricing and entitlements must be changed through versions.
   */
  async update(
    id: string,
    data: Prisma.BillingPlanUpdateInput,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Create a new plan version.
   */
  async createVersion(
    data: Prisma.BillingPlanVersionCreateInput,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlanVersion.create({
      data,
    });
  }

  /**
   * Update an existing version.
   *
   * Intended for controlled lifecycle operations such as publication.
   * Do not use this method to modify an already published version's
   * commercial terms.
   */
  async updateVersion(
    planId: string,
    planVersion: number,
    data: Prisma.BillingPlanVersionUpdateInput,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlanVersion.update({
      where: {
        planId_planVersion: {
          planId,
          planVersion,
        },
      },
      data,
    });
  }

  /**
   * Return the public pricing catalog.
   *
   * Only published plans with at least one published version
   * are included.
   */
  async findPublicPlans(
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.findMany({
      where: {
        status: BillingPlanStatus.PUBLISHED,
        versions: {
          some: {
            publishedAt: {
              not: null,
            },
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        versions: {
          where: {
            publishedAt: {
              not: null,
            },
          },
          orderBy: {
            planVersion: "desc",
          },
          take: 1,
        },
      },
    });
  }

  /**
   * Mark a plan as published.
   */
  async publish(
    id: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.update({
      where: { id },
      data: {
        status: BillingPlanStatus.PUBLISHED,
      },
    });
  }

  /**
   * Retire a plan.
   */
  async retire(
    id: string,
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    return db.billingPlan.update({
      where: { id },
      data: {
        status: BillingPlanStatus.RETIRED,
      },
    });
  }

  /**
   * Count plans matching optional filters.
   */
  async count(
    params?: {
      status?: BillingPlanStatus;
      search?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const db = this.getClient(tx);

    const {
      status,
      search,
    } = params ?? {};

    const normalizedSearch = search?.trim();

    const where: Prisma.BillingPlanWhereInput = {
      ...(status ? { status } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    return db.billingPlan.count({
      where,
    });
  }
}

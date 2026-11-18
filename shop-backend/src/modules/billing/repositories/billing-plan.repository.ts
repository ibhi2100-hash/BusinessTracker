import { BillingPlanStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class BillingPlanRepository {
  /**
   * Create a new billing plan.
   */
  async create(
    data: Prisma.BillingPlanCreateInput,
    tx: Prisma.TransactionClient 
  ) {
    return tx.billingPlan.create({
      data,
    });
  }

  /**
   * Retrieve a plan by its unique ID.
   */
  async findById(
    id: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlan.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { planVersion: "desc" },
        },
      },
    });
  }

  /**
   * Retrieve a plan by its unique code.
   */
  async findByCode(
    code: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlan.findUnique({
      where: { code },
    });
  }

  /**
   * List plans with pagination and optional filtering.
   */
  async findMany(params?: {
    status?: BillingPlanStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      status,
      search,
      skip = 0,
      take = 20,
    } = params ?? {};

    const where: Prisma.BillingPlanWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    return prisma.billingPlan.findMany({
      where,
      skip,
      take,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        versions: {
          orderBy: { planVersion: "desc" },
        },
      },
    });
  }

  /**
   * Update plan metadata.
   * Pricing and entitlements belong in BillingPlanVersion.
   */
  async update(
    id: string,
    data: Prisma.BillingPlanUpdateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlan.update({
      where: { id },
      data,
    });
  }

  /**
   * Create a new immutable pricing/version record.
   */
  async createVersion(
    data: Prisma.BillingPlanVersionCreateInput,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlanVersion.create({
      data,
    });
  }

  /**
   * Find a specific plan version.
   */
  async findVersion(
    planId: string,
    planVersion: number,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlanVersion.findUnique({
      where: {
        planId_planVersion: {
          planId,
          planVersion,
        },
      },
    });
  }

  /**
   * Get the latest published version of a plan.
   */
  async findLatestPublishedVersion(
    planId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlanVersion.findFirst({
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
   * List public pricing catalog.
   * Only published plans and published versions are returned.
   */
  async findPublicPlans() {
    return prisma.billingPlan.findMany({
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
   * Publish a plan.
   */
  async publish(
    id: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlan.update({
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
    tx: Prisma.TransactionClient
  ) {
    return tx.billingPlan.update({
      where: { id },
      data: {
        status: BillingPlanStatus.RETIRED,
      },
    });
  }

  /**
   * Count plans matching optional filters.
   */
  async count(params?: {
    status?: BillingPlanStatus;
    search?: string;
  }) {
    const { status, search } = params ?? {};

    const where: Prisma.BillingPlanWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    return prisma.billingPlan.count({ where });
  }
}

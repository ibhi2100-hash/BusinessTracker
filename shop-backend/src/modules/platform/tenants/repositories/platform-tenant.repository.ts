import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient;

export interface TenantListParams {
  search?: string;
  status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
  skip: number;
  take: number;
  sortBy?: "createdAt" | "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export class PlatformTenantRepository {
  /**
   * Paginated tenant directory.
   * Owner credentials and authentication fields are never selected.
   */
  async findMany(params: TenantListParams) {
    const where: Prisma.BusinessWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { id: { contains: params.search, mode: "insensitive" } },
              { address: { contains: params.search, mode: "insensitive" } },
              {
                owner: {
                  is: {
                    OR: [
                      { name: { contains: params.search, mode: "insensitive" } },
                      { email: { contains: params.search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    return prisma.business.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: {
        [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc",
      },
      select: {
        id: true,
        name: true,
        address: true,
        status: true,
        isOnboarding: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        activatedAt: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            branches: true,
            employees: true,
            products: true,
            billingSubscriptions: true,
          },
        },
      },
    });
  }

  async count(params: Pick<TenantListParams, "search" | "status">) {
    const where: Prisma.BusinessWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { id: { contains: params.search, mode: "insensitive" } },
              { address: { contains: params.search, mode: "insensitive" } },
              {
                owner: {
                  is: {
                    OR: [
                      { name: { contains: params.search, mode: "insensitive" } },
                      { email: { contains: params.search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    return prisma.business.count({ where });
  }

  async findById(businessId: string) {
    return prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        userId: true,
        address: true,
        status: true,
        isOnboarding: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        activatedAt: true,
        owner: {
          select: { id: true, name: true, email: true, isActive: true },
        },
        branches: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            isActive: true,
            isDefault: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { employees: true, products: true },
            },
          },
        },
        employees: {
          select: {
            id: true,
            employmentStatus: true,
          },
        },
        billingSubscriptions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            planId: true,
            planVersion: true,
            status: true,
            billingCycle: true,
            currency: true,
            priceMinor: true,
            trialStart: true,
            trialEnd: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            gracePeriodEnd: true,
            cancelAtPeriodEnd: true,
            activatedAt: true,
            cancelledAt: true,
            expiredAt: true,
            createdAt: true,
            updatedAt: true,
            planVersionRecord: {
              select: {
                plan: { select: { id: true, code: true, name: true } },
                maxStaff: true,
                maxBranch: true,
                maxProduct: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            branches: true,
            employees: true,
            products: true,
            billingSubscriptions: true,
            billingInvoices: true,
            billingPayments: true,
          },
        },
      },
    });
  }

  async findBranches(businessId: string) {
    return prisma.branch.findMany({
      where: { businessId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { employees: true, products: true, users: true },
        },
      },
    });
  }

  async findEmployees(
    businessId: string,
    params: {
      skip: number;
      take: number;
      branchId?: string;
      employmentStatus?: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
      search?: string;
    },
  ) {
    const where: Prisma.EmployeeWhereInput = {
      businessId,
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.employmentStatus
        ? { employmentStatus: params.employmentStatus }
        : {}),
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
              { employeeNumber: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return prisma.employee.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        employeeNumber: true,
        fullName: true,
        email: true,
        role: true,
        employmentStatus: true,
        joinedAt: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
      },
    });
  }

  async countEmployees(
    businessId: string,
    params: {
      branchId?: string;
      employmentStatus?: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
      search?: string;
    },
  ) {
    return prisma.employee.count({
      where: {
        businessId,
        ...(params.branchId ? { branchId: params.branchId } : {}),
        ...(params.employmentStatus
          ? { employmentStatus: params.employmentStatus }
          : {}),
        ...(params.search
          ? {
              OR: [
                { fullName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
                { employeeNumber: { contains: params.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    });
  }

  async getEmployeeStatusCounts(businessId: string) {
    return prisma.employee.groupBy({
      by: ["employmentStatus"],
      where: { businessId },
      _count: { _all: true },
    });
  }

  async getBranchStatusCounts(businessId: string) {
    return prisma.branch.groupBy({
      by: ["isActive"],
      where: { businessId },
      _count: { _all: true },
    });
  }

  async getProductCounts(businessId: string) {
    return prisma.product.count({
      where: { businessId, isDeleted: false },
    });
  }

  async getRecentBillingActivity(businessId: string) {
    const [invoices, payments] = await Promise.all([
      prisma.billingInvoice.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          currency: true,
          totalMinor: true,
          amountDueMinor: true,
          createdAt: true,
          dueAt: true,
        },
      }),
      prisma.billingPayment.findMany({
        where: { businessId },
        orderBy: { initiatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          status: true,
          currency: true,
          amountMinor: true,
          refundedMinor: true,
          initiatedAt: true,
          confirmedAt: true,
        },
      }),
    ]);

    return { invoices, payments };
  }

  async findStatusForUpdate(businessId: string, tx: DbClient) {
    return tx.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
        activatedAt: true,
      },
    });
  }

  /**
   * Update only the tenant status.
   * No business data, employees, sessions, events, or sync queues are deleted.
   */
  async updateStatus(
    businessId: string,
    status: "ACTIVE" | "SUSPENDED",
    tx: DbClient,
  ) {
    return tx.business.update({
      where: { id: businessId },
      data: {
        status,
        ...(status === "ACTIVE" ? { activatedAt: new Date() } : {}),
      },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true,
        activatedAt: true,
      },
    });
  }
}
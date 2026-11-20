import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";
import { PlatformTenantRepository } from "../repositories/platform-tenant.repository.js";
import { PlatformAuditService } from "../../audit/service/platform-audit.service.js";
import { PlatformAuditAction } from "../../audit/platform-audit.constants.js";

type TenantStatus = "ONBOARDING" | "ACTIVE" | "SUSPENDED";
type EmployeeStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";

export interface TenantDirectoryInput {
  search?: string;
  status?: TenantStatus;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface TenantEmployeeInput {
  page?: number;
  limit?: number;
  branchId?: string;
  employmentStatus?: EmployeeStatus;
  search?: string;
}

export interface TenantAdminContext {
  actorPlatformUserId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

export class PlatformTenantService {
  constructor(
    private readonly tenantRepository: PlatformTenantRepository,
    private readonly auditService: PlatformAuditService,
  ) {}

  private pagination(page = 1, limit = 25) {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Page must be a positive integer.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100.");
    }

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  private requireReason(reason: string) {
    const normalized = reason?.trim();

    if (!normalized || normalized.length < 5) {
      throw new Error("A reason of at least 5 characters is required.");
    }

    if (normalized.length > 2000) {
      throw new Error("Reason cannot exceed 2000 characters.");
    }

    return normalized;
  }

  async listTenants(input: TenantDirectoryInput = {}) {
    const pagination = this.pagination(input.page, input.limit);
    const search = input.search?.trim();

    if (search && search.length > 120) {
      throw new Error("Search cannot exceed 120 characters.");
    }

    const params = {
      search: search || undefined,
      status: input.status,
      skip: pagination.skip,
      take: pagination.take,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    const [items, total] = await Promise.all([
      this.tenantRepository.findMany(params),
      this.tenantRepository.count(params),
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getTenant(businessId: string) {
    const tenant = await this.tenantRepository.findById(businessId);

    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    const employeeStatuses = await this.tenantRepository.getEmployeeStatusCounts(
      businessId,
    );

    const employeeCounts = {
      INVITED: 0,
      ACTIVE: 0,
      SUSPENDED: 0,
      REMOVED: 0,
    };

    for (const item of employeeStatuses) {
      employeeCounts[item.employmentStatus] = item._count._all;
    }

    const activeBranches = tenant.branches.filter((branch) => branch.isActive).length;
    const activeProducts = await this.tenantRepository.getProductCounts(businessId);

    return {
      ...tenant,
      summary: {
        branches: {
          total: tenant._count.branches,
          active: activeBranches,
          inactive: tenant._count.branches - activeBranches,
        },
        employees: {
          total: tenant._count.employees,
          ...employeeCounts,
        },
        products: activeProducts,
        users: tenant._count.users,
        subscriptions: tenant._count.billingSubscriptions,
        invoices: tenant._count.billingInvoices,
        payments: tenant._count.billingPayments,
      },
      // Do not expose password, refresh token, session, or credential material.
      owner: tenant.owner,
      billingSubscriptions: tenant.billingSubscriptions.map((subscription) => ({
        ...subscription,
        priceMinor: subscription.priceMinor.toString(),
      })),
    };
  }

  async getTenantBranches(businessId: string) {
    const tenant = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    const [branches, statusCounts] = await Promise.all([
      this.tenantRepository.findBranches(businessId),
      this.tenantRepository.getBranchStatusCounts(businessId),
    ]);

    return {
      items: branches,
      summary: {
        total: branches.length,
        active: statusCounts.find((item) => item.isActive)?._count._all ?? 0,
        inactive: statusCounts.find((item) => !item.isActive)?._count._all ?? 0,
      },
    };
  }

  async getTenantEmployees(
    businessId: string,
    input: TenantEmployeeInput = {},
  ) {
    const pagination = this.pagination(input.page, input.limit);

    const tenant = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    if (input.search && input.search.length > 120) {
      throw new Error("Search cannot exceed 120 characters.");
    }

    if (input.branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: input.branchId, businessId },
        select: { id: true },
      });

      if (!branch) {
        throw new Error("Branch does not belong to this tenant.");
      }
    }

    const params = {
      branchId: input.branchId,
      employmentStatus: input.employmentStatus,
      search: input.search?.trim() || undefined,
    };

    const [items, total] = await Promise.all([
      this.tenantRepository.findEmployees(businessId, {
        ...params,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.tenantRepository.countEmployees(businessId, params),
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getTenantOperationalOverview(businessId: string) {
    const tenant = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        activatedAt: true,
      },
    });

    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    const [
      branchStatus,
      employeeStatus,
      recentBilling,
      recentSyncCheckpoints,
    ] = await Promise.all([
      this.tenantRepository.getBranchStatusCounts(businessId),
      this.tenantRepository.getEmployeeStatusCounts(businessId),
      this.tenantRepository.getRecentBillingActivity(businessId),
      prisma.deviceSyncCheckpoint.findMany({
        where: { businessId },
        orderBy: { lastSeenAt: "desc" },
        take: 10,
        select: {
          deviceId: true,
          lastAcknowledgedPosition: true,
          lastSeenAt: true,
        },
      }),
    ]);

    return {
      tenant,
      branches: branchStatus.map((item) => ({
        isActive: item.isActive,
        count: item._count._all,
      })),
      employees: employeeStatus.map((item) => ({
        status: item.employmentStatus,
        count: item._count._all,
      })),
      recentBilling,
      sync: {
        devicesSeen: recentSyncCheckpoints.length,
        latestDeviceActivity: recentSyncCheckpoints[0]?.lastSeenAt ?? null,
        devices: recentSyncCheckpoints.map((checkpoint) => ({
          ...checkpoint,
          lastAcknowledgedPosition:
            checkpoint.lastAcknowledgedPosition.toString(),
        })),
      },
    };
  }

  async suspendTenant(
    businessId: string,
    context: TenantAdminContext,
  ) {
    const reason = this.requireReason(context.reason);

    return prisma.$transaction(async (tx) => {
      const before = await this.tenantRepository.findStatusForUpdate(
        businessId,
        tx,
      );

      if (!before) {
        throw new Error("Tenant not found.");
      }

      if (before.status === "SUSPENDED") {
        throw new Error("Tenant is already suspended.");
      }

      const after = await this.tenantRepository.updateStatus(
        businessId,
        "SUSPENDED",
        tx,
      );

      await this.auditService.record(
        {
          actorPlatformUserId: context.actorPlatformUserId,
          action: PlatformAuditAction.TENANT_SUSPENDED,
          resourceType: "Business",
          resourceId: businessId,
          targetBusinessId: businessId,
          reason,
          beforeData: {
            name: before.name,
            status: before.status,
          },
          afterData: {
            name: after.name,
            status: after.status,
          },
          metadata: {
            operation: "TENANT_SUSPENSION",
            syncDataPreserved: true,
          },
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          correlationId: context.correlationId ?? null,
        },
        tx,
      );

      return after;
    });
  }

  async reactivateTenant(
    businessId: string,
    context: TenantAdminContext,
  ) {
    const reason = this.requireReason(context.reason);

    return this.prisma.$transaction(async (tx) => {
      const before = await this.tenantRepository.findStatusForUpdate(
        businessId,
        tx,
      );

      if (!before) {
        throw new Error("Tenant not found.");
      }

      if (before.status === "ACTIVE") {
        throw new Error("Tenant is already active.");
      }

      if (before.status === "ONBOARDING") {
        throw new Error(
          "An onboarding tenant cannot be reactivated. Complete onboarding first.",
        );
      }

      const after = await this.tenantRepository.updateStatus(
        businessId,
        "ACTIVE",
        tx,
      );

      await this.auditService.record(
        {
          actorPlatformUserId: context.actorPlatformUserId,
          action: PlatformAuditAction.TENANT_REACTIVATED,
          resourceType: "Business",
          resourceId: businessId,
          targetBusinessId: businessId,
          reason,
          beforeData: {
            name: before.name,
            status: before.status,
          },
          afterData: {
            name: after.name,
            status: after.status,
          },
          metadata: {
            operation: "TENANT_REACTIVATION",
          },
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          correlationId: context.correlationId ?? null,
        },
        tx,
      );

      return after;
    });
  }
}
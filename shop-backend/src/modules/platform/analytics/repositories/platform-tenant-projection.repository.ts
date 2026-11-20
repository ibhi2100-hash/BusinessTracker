import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";

export class PlatformTenantProjectionRepository {

  async rebuild(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        activatedAt: true,
        updatedAt: true,

        branches: {
          select: { isActive: true },
        },

        employees: {
          select: { employmentStatus: true },
        },

        products: {
          where: { isDeleted: false },
          select: { id: true },
        },

        billingSubscriptions: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            planId: true,
            planVersion: true,
            status: true,
            billingCycle: true,
            currency: true,
            priceMinor: true,
            updatedAt: true,
          },
        },

        events: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },

        deviceSyncCheckpoints: {
          orderBy: { lastSeenAt: "desc" },
          take: 1,
          select: { lastSeenAt: true },
        },
      },
    });

    if (!business) {
      // Do not silently delete the projection. A missing tenant may be a
      // deletion or data-integrity incident requiring explicit reconciliation.
      throw new Error(`Business ${businessId} does not exist.`);
    }

    const totalBranches = business.branches.length;
    const activeBranches = business.branches.filter((b) => b.isActive).length;

    const totalEmployees = business.employees.length;
    const activeEmployees = business.employees.filter(
      (e) => e.employmentStatus === "ACTIVE",
    ).length;

    const totalSubscriptions = business.billingSubscriptions.length;
    const activeSubscriptions = business.billingSubscriptions.filter(
      (s) => s.status === "ACTIVE",
    ).length;

    const currentSubscription = business.billingSubscriptions.find(
      (s) => s.status === "ACTIVE" || s.status === "TRIALING",
    );

    const recurringAmountMinor = business.billingSubscriptions
      .filter((s) => s.status === "ACTIVE")
      .reduce((total, subscription) => {
        // Normalize recurring subscriptions to monthly value.
        // Lifetime plans are not recurring revenue.
        switch (subscription.billingCycle) {
          case "MONTHLY":
            return total + subscription.priceMinor;
          case "QUARTERLY":
            return total + subscription.priceMinor / 3n;
          case "YEARLY":
            return total + subscription.priceMinor / 12n;
          case "LIFETIME":
            return total;
          default:
            return total;
        }
      }, 0n);

    const data = {
      businessName: business.name,
      businessStatus: business.status,
      registeredAt: business.createdAt,
      activatedAt: business.activatedAt,

      totalBranches,
      activeBranches,

      totalEmployees,
      activeEmployees,

      totalProducts: business.products.length,

      totalSubscriptions,
      activeSubscriptions,

      currentPlanId: currentSubscription?.planId ?? null,
      currentPlanVersion: currentSubscription?.planVersion ?? null,
      currentSubscriptionStatus: currentSubscription?.status ?? null,

      currency: currentSubscription?.currency ?? null,
      recurringAmountMinor,

      lastActivityAt: business.events[0]?.createdAt ?? null,
      lastSyncAt: business.deviceSyncCheckpoints[0]?.lastSeenAt ?? null,
    };

    return this.prisma.platformTenantProjection.upsert({
      where: { businessId },
      create: {
        businessId,
        ...data,
      },
      update: data,
    });
  }

  async rebuildAll(batchSize = 100) {
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
      throw new Error("Batch size must be between 1 and 500.");
    }

    let cursor: string | undefined;
    let processed = 0;

    while (true) {
      const businesses = await prisma.business.findMany({
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
        select: { id: true },
      });

      if (businesses.length === 0) break;

      for (const business of businesses) {
        await this.rebuild(business.id);
        processed++;
      }

      cursor = businesses[businesses.length - 1].id;
    }

    return { processed };
  }

  async findMany(params: {
    skip: number;
    take: number;
    search?: string;
    status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
  }) {
    return prisma.platformTenantProjection.findMany({
      where: {
        ...(params.status ? { businessStatus: params.status } : {}),
        ...(params.search
          ? {
              businessName: {
                contains: params.search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      skip: params.skip,
      take: params.take,
      orderBy: { updatedAt: "desc" },
    });
  }

  async count(params: {
    search?: string;
    status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
  }) {
    return prisma.platformTenantProjection.count({
      where: {
        ...(params.status ? { businessStatus: params.status } : {}),
        ...(params.search
          ? {
              businessName: {
                contains: params.search,
                mode: "insensitive",
              },
            }
          : {}),
      },
    });
  }
}
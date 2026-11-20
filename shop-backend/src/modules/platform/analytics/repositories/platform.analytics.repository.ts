import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";

export class PlatformAnalyticsRepository {

  async getBusinessCounts() {
    const rows = await prisma.platformTenantProjection.groupBy({
      by: ["businessStatus"],
      _count: { _all: true },
    });

    const result = {
      total: 0,
      active: 0,
      onboarding: 0,
      suspended: 0,
    };

    for (const row of rows) {
      result.total += row._count._all;

      if (row.businessStatus === "ACTIVE") {
        result.active = row._count._all;
      } else if (row.businessStatus === "ONBOARDING") {
        result.onboarding = row._count._all;
      } else if (row.businessStatus === "SUSPENDED") {
        result.suspended = row._count._all;
      }
    }

    return result;
  }

  async getOperationalTotals() {
    const result = await prisma.platformTenantProjection.aggregate({
      _sum: {
        totalBranches: true,
        activeBranches: true,
        totalEmployees: true,
        activeEmployees: true,
        totalProducts: true,
        totalSubscriptions: true,
        activeSubscriptions: true,
      },
    });

    return {
      branches: {
        total: result._sum.totalBranches ?? 0,
        active: result._sum.activeBranches ?? 0,
      },
      employees: {
        total: result._sum.totalEmployees ?? 0,
        active: result._sum.activeEmployees ?? 0,
      },
      products: {
        total: result._sum.totalProducts ?? 0,
      },
      subscriptions: {
        total: result._sum.totalSubscriptions ?? 0,
        active: result._sum.activeSubscriptions ?? 0,
      },
    };
  }

  async getSubscriptionDistribution() {
    const rows = await prisma.platformTenantProjection.groupBy({
      by: ["currentSubscriptionStatus"],
      _count: { _all: true },
    });

    return rows.map((row) => ({
      status: row.currentSubscriptionStatus ?? "NONE",
      businesses: row._count._all,
    }));
  }

  async getRevenueSnapshot(currency = "NGN") {
    const latest = await prisma.platformRevenueDaily.findFirst({
      where: { currency },
      orderBy: { metricDate: "desc" },
    });

    return {
      currency,
      grossCollectedMinor: latest?.grossCollectedMinor.toString() ?? "0",
      refundsMinor: latest?.refundsMinor.toString() ?? "0",
      netCollectedMinor: latest?.netCollectedMinor.toString() ?? "0",
      outstandingMinor: latest?.outstandingMinor.toString() ?? "0",
      recurringRevenueMinor: latest?.recurringRevenueMinor.toString() ?? "0",
      metricDate: latest?.metricDate ?? null,
    };
  }

  async getRevenueSeries(
    currency: string,
    from: Date,
    to: Date,
  ) {
    return prisma.platformRevenueDaily.findMany({
      where: {
        currency,
        metricDate: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { metricDate: "asc" },
    });
  }

  async getDailyMetrics(
    metricKey: string,
    from: Date,
    to: Date,
  ) {
    return prisma.platformDailyMetric.findMany({
      where: {
        metricKey,
        metricDate: {
          gte: from,
          lte: to,
        },
      },
      orderBy: { metricDate: "asc" },
    });
  }

  async getProjectionCheckpoint(consumerName: string) {
    return prisma.platformProjectionCheckpoint.findUnique({
      where: { consumerName },
    });
  }

  async getLatestProjectionUpdate() {
    return prisma.platformTenantProjection.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
  }

  async getTenantGrowth(from: Date, to: Date) {
    return prisma.platformTenantProjection.groupBy({
      by: ["registeredAt"],
      where: {
        registeredAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      orderBy: { registeredAt: "asc" },
    });
  }
}
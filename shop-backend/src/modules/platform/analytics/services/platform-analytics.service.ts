import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";
import { PlatformAnalyticsRepository } from "../repositories/platform.analytics.repository.js";
import { PlatformTenantProjectionRepository } from "../repositories/platform-tenant-projection.repository.js";
import { PlatformRevenueRepository } from "../repositories/platform-revenue.repository.js";

export class PlatformAnalyticsService {
  constructor(
    private readonly analyticsRepository: PlatformAnalyticsRepository,
    private readonly tenantProjectionRepository: PlatformTenantProjectionRepository,
    private readonly revenueRepository: PlatformRevenueRepository,
  ) {}

  private validateDateRange(fromInput: string, toInput: string) {
    const from = new Date(fromInput);
    const to = new Date(toInput);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from > to
    ) {
      throw new Error("A valid date range is required.");
    }

    const days = Math.ceil(
      (to.getTime() - from.getTime()) / 86_400_000,
    );

    if (days > 366) {
      throw new Error("Date range cannot exceed 366 days.");
    }

    return { from, to };
  }

  async getDashboardSummary(currency = "NGN") {
    const [
      businesses,
      operational,
      subscriptionDistribution,
      revenue,
      latestProjection,
      tenantCheckpoint,
    ] = await Promise.all([
      this.analyticsRepository.getBusinessCounts(),
      this.analyticsRepository.getOperationalTotals(),
      this.analyticsRepository.getSubscriptionDistribution(),
      this.analyticsRepository.getRevenueSnapshot(currency),
      this.analyticsRepository.getLatestProjectionUpdate(),
      this.analyticsRepository.getProjectionCheckpoint(
        "PLATFORM_TENANT_PROJECTION",
      ),
    ]);

    const subscriptions = {
      total: operational.subscriptions.total,
      active: 0,
      trialing: 0,
      pastDue: 0,
      suspended: 0,
      cancelled: 0,
    };

    for (const row of subscriptionDistribution) {
      switch (row.status) {
        case "ACTIVE":
          subscriptions.active += row.businesses;
          break;
        case "TRIALING":
          subscriptions.trialing += row.businesses;
          break;
        case "PAST_DUE":
          subscriptions.pastDue += row.businesses;
          break;
        case "SUSPENDED":
          subscriptions.suspended += row.businesses;
          break;
        case "CANCELLED":
          subscriptions.cancelled += row.businesses;
          break;
      }
    }

    return {
      businesses,
      branches: operational.branches,
      employees: operational.employees,
      products: operational.products,
      subscriptions,
      revenue,
      projection: {
        lastUpdatedAt: latestProjection?.updatedAt ?? null,
        tenantEventPosition:
          tenantCheckpoint?.lastProcessedPosition.toString() ?? "0",
      },
    };
  }

  async getRevenueTrend(
    currency: string,
    fromInput: string,
    toInput: string,
  ) {
    const { from, to } = this.validateDateRange(fromInput, toInput);

    const rows = await this.analyticsRepository.getRevenueSeries(
      currency,
      from,
      to,
    );

    return rows.map((row) => ({
      date: row.metricDate,
      currency: row.currency,
      grossCollectedMinor: row.grossCollectedMinor.toString(),
      refundsMinor: row.refundsMinor.toString(),
      netCollectedMinor: row.netCollectedMinor.toString(),
      providerFeesMinor: row.providerFeesMinor.toString(),
      invoicesIssuedMinor: row.invoicesIssuedMinor.toString(),
      outstandingMinor: row.outstandingMinor.toString(),
      recurringRevenueMinor: row.recurringRevenueMinor.toString(),
      successfulPayments: row.successfulPayments,
      failedPayments: row.failedPayments,
      payingBusinesses: row.payingBusinesses,
    }));
  }

  async getMetricTrend(
    metricKey: string,
    fromInput: string,
    toInput: string,
  ) {
    if (!metricKey.trim()) {
      throw new Error("Metric key is required.");
    }

    const { from, to } = this.validateDateRange(fromInput, toInput);

    const rows = await this.analyticsRepository.getDailyMetrics(
      metricKey,
      from,
      to,
    );

    return rows.map((row) => ({
      date: row.metricDate,
      metricKey: row.metricKey,
      dimensionKey: row.dimensionKey,
      dimensionValue: row.dimensionValue,
      currency: row.currency,
      value: row.value.toString(),
    }));
  }

  async getTenantGrowth(fromInput: string, toInput: string) {
    const { from, to } = this.validateDateRange(fromInput, toInput);

    return this.analyticsRepository.getDailyMetrics(
      "BUSINESSES_REGISTERED",
      from,
      to,
    );
  }

  async getTenantProjectionHealth() {
    const [tenantCheckpoint, billingCheckpoint, totalBusinesses, projected] =
      await Promise.all([
        this.analyticsRepository.getProjectionCheckpoint(
          "PLATFORM_TENANT_PROJECTION",
        ),
        this.analyticsRepository.getProjectionCheckpoint(
          "PLATFORM_BILLING_PROJECTION",
        ),
        prisma.business.count(),
        prisma.platformTenantProjection.count(),
      ]);

    return {
      tenants: {
        sourceCount: totalBusinesses,
        projectedCount: projected,
        missingCount: Math.max(0, totalBusinesses - projected),
      },
      consumers: {
        tenant: tenantCheckpoint
          ? {
              lastProcessedPosition:
                tenantCheckpoint.lastProcessedPosition.toString(),
              lastProcessedAt: tenantCheckpoint.lastProcessedAt,
            }
          : null,
        billing: billingCheckpoint
          ? {
              lastProcessedEventId: billingCheckpoint.lastProcessedEventId,
              lastProcessedAt: billingCheckpoint.lastProcessedAt,
              cursor: billingCheckpoint.lastProcessedPosition,
            }
          : null,
      },
    };
  }

  async rebuildTenantProjection(businessId: string) {
    return this.tenantProjectionRepository.rebuild(businessId);
  }

  async rebuildAllTenantProjections() {
    return this.tenantProjectionRepository.rebuildAll(100);
  }

  async rebuildRevenue(
    fromInput: string,
    toInput: string,
    currencies: string[],
  ) {
    const { from, to } = this.validateDateRange(fromInput, toInput);

    if (!currencies.length || currencies.length > 10) {
      throw new Error("Provide between 1 and 10 currencies.");
    }

    const normalized = [...new Set(
      currencies.map((currency) => currency.trim().toUpperCase()),
    )];

    if (normalized.some((currency) => !/^[A-Z]{3}$/.test(currency))) {
      throw new Error("Currencies must be three-letter currency codes.");
    }

    return this.revenueRepository.rebuildRange(
      from,
      to,
      normalized,
    );
  }
}
import type { Request, Response } from "express";
import { PlatformAnalyticsService } from "../services/platform-analytics.service.js";

export class PlatformAnalyticsController {
  constructor(private readonly analyticsService: PlatformAnalyticsService) {}

  private async execute(
    res: Response,
    operation: () => Promise<unknown>,
  ): Promise<Response> {
    try {
      const data = await operation();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error.";

      const isValidationError =
        message.includes("required") ||
        message.includes("valid date") ||
        message.includes("exceed") ||
        message.includes("between") ||
        message.includes("currency");

      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: isValidationError
          ? message
          : "Unable to retrieve platform analytics.",
      });
    }
  }

  dashboard = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const currency =
      typeof req.query.currency === "string"
        ? req.query.currency.toUpperCase()
        : "NGN";

    return this.execute(res, () =>
      this.analyticsService.getDashboardSummary(currency),
    );
  };

  revenueTrend = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.getRevenueTrend(
        String(req.query.currency ?? "NGN").toUpperCase(),
        String(req.query.from ?? ""),
        String(req.query.to ?? ""),
      ),
    );
  };

  metricTrend = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.getMetricTrend(
        String(req.params.metricKey),
        String(req.query.from ?? ""),
        String(req.query.to ?? ""),
      ),
    );
  };

  tenantGrowth = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.getTenantGrowth(
        String(req.query.from ?? ""),
        String(req.query.to ?? ""),
      ),
    );
  };

  projectionHealth = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.getTenantProjectionHealth(),
    );
  };

  rebuildTenant = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.rebuildTenantProjection(
        req.params.businessId,
      ),
    );
  };

  rebuildAllTenants = async (
    _req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.analyticsService.rebuildAllTenantProjections(),
    );
  };

  rebuildRevenue = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const currencies = Array.isArray(req.body?.currencies)
      ? req.body.currencies.map(String)
      : ["NGN"];

    return this.execute(res, () =>
      this.analyticsService.rebuildRevenue(
        String(req.body?.from ?? ""),
        String(req.body?.to ?? ""),
        currencies,
      ),
    );
  };
}
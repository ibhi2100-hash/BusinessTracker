import type { Request, Response } from "express";
import type { AuthenticatedPlatformRequest } from "../../identity/types/platform-auth.types.js";
import { PlatformTenantService } from "../services/platform-tenant.service.js";

export class PlatformTenantController {
  constructor(private readonly tenantService: PlatformTenantService) {}

  private context(req: AuthenticatedPlatformRequest) {
    if (!req.platformUser?.id) {
      throw new Error("Authenticated platform user is missing.");
    }

    return {
      actorPlatformUserId: req.platformUser.id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
      correlationId: req.correlationId,
    };
  }

  private async execute(
    res: Response,
    operation: () => Promise<unknown>,
    statusCode = 200,
  ) {
    try {
      const data = await operation();
      return res.status(statusCode).json({ success: true, data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected server error.";

      const status =
        message === "Tenant not found." ? 404 :
        message.includes("already") ||
        message.includes("cannot be reactivated") ||
        message.includes("does not belong") ? 409 :
        message.includes("required") ||
        message.includes("exceed") ||
        message.includes("positive integer") ||
        message.includes("between 1 and 100") ? 400 :
        500;

      return res.status(status).json({
        success: false,
        message: status === 500 ? "Unable to complete tenant operation." : message,
      });
    }
  }

  list = async (req: Request, res: Response): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.listTenants({
        search: typeof req.query.search === "string" ? req.query.search : undefined,
        status: typeof req.query.status === "string"
          ? req.query.status as "ONBOARDING" | "ACTIVE" | "SUSPENDED"
          : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 25,
        sortBy: typeof req.query.sortBy === "string"
          ? req.query.sortBy as "createdAt" | "name" | "updatedAt"
          : "createdAt",
        sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
      }),
    );
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.getTenant(req.params.businessId),
    );
  };

  branches = async (req: Request, res: Response): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.getTenantBranches(req.params.businessId),
    );
  };

  employees = async (req: Request, res: Response): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.getTenantEmployees(req.params.businessId, {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 25,
        branchId: typeof req.query.branchId === "string"
          ? req.query.branchId
          : undefined,
        employmentStatus: typeof req.query.employmentStatus === "string"
          ? req.query.employmentStatus as
              "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED"
          : undefined,
        search: typeof req.query.search === "string"
          ? req.query.search
          : undefined,
      }),
    );
  };

  operationalOverview = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.getTenantOperationalOverview(req.params.businessId),
    );
  };

  suspend = async (
    req: AuthenticatedPlatformRequest,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.suspendTenant(req.params.businessId, {
        ...this.context(req),
        reason: req.body?.reason,
      }),
    );
  };

  reactivate = async (
    req: AuthenticatedPlatformRequest,
    res: Response,
  ): Promise<Response> => {
    return this.execute(res, () =>
      this.tenantService.reactivateTenant(req.params.businessId, {
        ...this.context(req),
        reason: req.body?.reason,
      }),
    );
  };
}
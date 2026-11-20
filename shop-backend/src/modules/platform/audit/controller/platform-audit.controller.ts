import type { Request, Response } from "express";

import { PlatformAuditService } from "../service/platform-audit.service.js"; 

interface AuthenticatedPlatformRequest extends Request {
  platformUser?: {
    id: string;
    sessionId?: string;
  };
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}

function parseInteger(
  value: unknown,
  fallback: number
): number {
  if (value === undefined) return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new Error("Invalid pagination value");
  }

  return parsed;
}

function parseDate(
  value: unknown
): Date | undefined {
  if (value === undefined) return undefined;

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Invalid date filter");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date filter");
  }

  return date;
}

export class PlatformAuditController {
  constructor(
    private readonly auditService: PlatformAuditService
  ) {}

  /**
   * List audit records with optional filters.
   *
   * GET /api/platform/audit
   */
  async list(
    _req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const req = _req;

      const actorPlatformUserId = optionalString(
        req.query.actorPlatformUserId
      );
      const targetBusinessId = optionalString(
        req.query.targetBusinessId
      );
      const action = optionalString(req.query.action);
      const resourceType = optionalString(
        req.query.resourceType
      );
      const resourceId = optionalString(
        req.query.resourceId
      );
      const correlationId = optionalString(
        req.query.correlationId
      );
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);

      const result = await this.auditService.list({
        ...(actorPlatformUserId === undefined ? {} : { actorPlatformUserId }),
        ...(targetBusinessId === undefined ? {} : { targetBusinessId }),
        ...(action === undefined ? {} : { action }),
        ...(resourceType === undefined ? {} : { resourceType }),
        ...(resourceId === undefined ? {} : { resourceId }),
        ...(correlationId === undefined ? {} : { correlationId }),
        ...(from === undefined ? {} : { from }),
        ...(to === undefined ? {} : { to }),

        skip: parseInteger(req.query.skip, 0),
        take: parseInteger(req.query.take, 50),
      });

      return res.status(200).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Retrieve one audit record.
   *
   * GET /api/platform/audit/:auditId
   */
  async getById(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const record = await this.auditService.getById(
        String(req.params.auditId)
      );

      return res.status(200).json({ record });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Retrieve the history of one resource.
   *
   * GET /api/platform/audit/resource/:resourceType/:resourceId
   */
  async resourceHistory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const records =
        await this.auditService.getResourceHistory(
          String(req.params.resourceType),
          String(req.params.resourceId),
          {
            skip: parseInteger(req.query.skip, 0),
            take: parseInteger(req.query.take, 50),
          }
        );

      return res.status(200).json({
        records,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Retrieve all platform activity affecting a tenant.
   *
   * GET /api/platform/audit/business/:businessId
   */
  async businessHistory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const records =
        await this.auditService.getBusinessHistory(
          String(req.params.businessId),
          {
            skip: parseInteger(req.query.skip, 0),
            take: parseInteger(req.query.take, 50),
          }
        );

      return res.status(200).json({
        records,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Retrieve all activity performed by a platform user.
   *
   * GET /api/platform/audit/actor/:platformUserId
   */
  async actorHistory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const records =
        await this.auditService.getActorHistory(
          String(req.params.platformUserId),
          {
            skip: parseInteger(req.query.skip, 0),
            take: parseInteger(req.query.take, 50),
          }
        );

      return res.status(200).json({
        records,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Retrieve all records generated by one request.
   *
   * GET /api/platform/audit/correlation/:correlationId
   */
  async correlationHistory(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const records =
        await this.auditService.getCorrelationHistory(
          String(req.params.correlationId)
        );

      return res.status(200).json({
        records,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  private handleError(
    res: Response,
    error: unknown
  ): Response {
    const message =
      error instanceof Error
        ? error.message
        : "Platform audit operation failed";

    if (
      message.includes("not found")
    ) {
      return res.status(404).json({ message });
    }

    if (
      message.includes("Invalid") ||
      message.includes("required") ||
      message.includes("cannot be")
    ) {
      return res.status(400).json({ message });
    }

    return res.status(500).json({
      message: "Unable to retrieve platform audit records",
    });
  }
}
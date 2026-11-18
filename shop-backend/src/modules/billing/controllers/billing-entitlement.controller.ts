import type { Request, Response } from "express";
import { BillingEntitlementService } from "../services/billing-entitlement.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
    role?: string;
  };
}

export class BillingEntitlementController {
  constructor(
    private readonly entitlementService: BillingEntitlementService
  ) {}

  async list(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          message: "Business context is required",
        });
      }

      const entitlements =
        await this.entitlementService.getEffectiveEntitlements(
          businessId
        );

      return res.status(200).json({
        entitlements,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async get(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          message: "Business context is required",
        });
      }

      const entitlement =
        await this.entitlementService.getEntitlement(
          businessId,
          req.params.key
        );

      return res.status(200).json({
        entitlement,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createOverride(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const user = req.user;
      const businessId = user?.businessId;

      if (!user?.id || !businessId) {
        return res.status(401).json({
          message: "Authenticated business user required",
        });
      }

      const {
        subscriptionId,
        entitlementKey,
        value,
        reason,
        startsAt,
        expiresAt,
      } = req.body;

      if (
        !entitlementKey ||
        value === undefined ||
        !reason
      ) {
        return res.status(400).json({
          message: "Entitlement key, value and reason are required",
        });
      }

      const override =
        await this.entitlementService.createOverride({
          businessId,
          subscriptionId,
          entitlementKey,
          value,
          reason,
          createdBy: user.id,
          startsAt: startsAt ? new Date(startsAt) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

      return res.status(201).json({
        message: "Entitlement override created",
        override,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async revokeOverride(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          message: "Revocation reason is required",
        });
      }

      const override =
        await this.entitlementService.revokeOverride(
          req.params.overrideId,
          req.user.id,
          reason
        );

      return res.status(200).json({
        message: "Entitlement override revoked",
        override,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  private handleError(
    res: Response,
    error: unknown
  ): Response {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Entitlement operation failed",
    });
  }
}
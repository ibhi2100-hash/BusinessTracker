import type { Request, Response } from "express";
import { BillingActivationService } from "../services/billing-activation.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
  };
}

export class BillingActivationController {
  constructor(
    private readonly activationService: BillingActivationService
  ) {}

  async activate(
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

      const { deviceId, branchId } = req.body;

      if (
        typeof deviceId !== "string" ||
        !deviceId.trim()
      ) {
        return res.status(400).json({
          message: "Device ID is required",
        });
      }

      const result =
        await this.activationService.activate({
          businessId,
          userId: user.id,
          deviceId: deviceId.trim(),
          branchId,
        });

      return res.status(200).json({
        message: "Business activated successfully",
        business: result.business,
        lease: result.lease,
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
          : "Business activation failed",
    });
  }
}
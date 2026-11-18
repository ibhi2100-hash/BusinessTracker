import type { Request, Response } from "express";
import { BillingRefundService } from "../services/billing-refund.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
  };
}

export class BillingRefundController {
  constructor(
    private readonly refundService: BillingRefundService
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

      const paymentId =
        typeof req.query.paymentId === "string"
          ? req.query.paymentId
          : undefined;

      const refunds =
        await this.refundService.listRefunds(
          businessId,
          paymentId
        );

      return res.status(200).json({ refunds });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async request(
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

      const {
        paymentId,
        amountMinor,
        reason,
      } = req.body;

      if (!paymentId || !reason) {
        return res.status(400).json({
          message: "Payment ID and refund reason are required",
        });
      }

      let amount: bigint;

      try {
        amount = BigInt(String(amountMinor));
      } catch {
        return res.status(400).json({
          message: "Invalid refund amount",
        });
      }

      if (amount <= 0n) {
        return res.status(400).json({
          message: "Refund amount must be greater than zero",
        });
      }

      const refund =
        await this.refundService.requestRefund({
          businessId,
          paymentId,
          amountMinor: amount,
          reason,
        });

      return res.status(201).json({
        message: "Refund request submitted",
        refund,
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
          : "Refund operation failed",
    });
  }
}
import type { Request, Response } from "express";
import {
  BillingPaymentMethod,
  BillingProvider,
} from "../../../generated/client/index.js";

import { BillingPaymentService } from "../services/billing-payment.service.js";
import { BillingProviderService } from "../services/billing-provider.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
  };
}

export class BillingPaymentController {
  constructor(
    private readonly paymentService: BillingPaymentService,
    private readonly providerService: BillingProviderService,
    private readonly callbackUrl: string
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

      const payments =
        await this.paymentService.listPayments(businessId);

      return res.status(200).json({ payments });
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

      const payment =
        await this.paymentService.getPayment(
          businessId,
          req.params.paymentId
        );

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      return res.status(200).json({ payment });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async initiate(
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
        invoiceId,
        subscriptionId,
        provider,
        method,
        amountMinor,
        currency,
      } = req.body;

      if (
        !invoiceId ||
        !currency ||
        !Object.values(BillingProvider).includes(provider) ||
        !Object.values(BillingPaymentMethod).includes(method)
      ) {
        return res.status(400).json({
          message: "Invalid payment details",
        });
      }

      let amount: bigint;

      try {
        amount = BigInt(String(amountMinor));
      } catch {
        return res.status(400).json({
          message: "Invalid payment amount",
        });
      }

      if (amount <= 0n) {
        return res.status(400).json({
          message: "Payment amount must be greater than zero",
        });
      }

      const headerKey = req.get("idempotency-key");
      const idempotencyKey =
        headerKey || req.body.idempotencyKey;

      if (
        typeof idempotencyKey !== "string" ||
        !idempotencyKey.trim()
      ) {
        return res.status(400).json({
          message: "An idempotency key is required",
        });
      }

      const payment =
        await this.paymentService.initiate({
          businessId,
          subscriptionId,
          invoiceId,
          provider,
          method,
          amountMinor: amount,
          currency,
          idempotencyKey: idempotencyKey.trim(),
        });

      const checkout =
        await this.providerService.initializePayment(
          payment.id,
          this.callbackUrl
        );

      return res.status(201).json({
        message: "Payment initialized successfully",
        paymentId: payment.id,
        checkout,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async verify(
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

      const payment =
        await this.paymentService.getPayment(
          businessId,
          req.params.paymentId
        );

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      // The frontend cannot mark a payment as successful.
      // The backend verifies directly with the payment provider.
      const result =
        await this.providerService.verifyPayment(payment.id);

      return res.status(200).json({
        message: result.verified
          ? "Payment verified"
          : "Payment has not been confirmed",
        ...result,
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
          : "Payment operation failed",
    });
  }
}
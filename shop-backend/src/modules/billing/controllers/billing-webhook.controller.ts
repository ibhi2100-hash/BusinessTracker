import type { Request, Response } from "express";
import { BillingProvider } from "../../../generated/client/index.js";
import { BillingWebhookService } from "../services/billing-webhook.service.js";

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

export class BillingWebhookController {
  constructor(
    private readonly webhookService: BillingWebhookService
  ) {}

  async receivePaystack(
    req: RawBodyRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.rawBody) {
        return res.status(400).json({
          message: "Raw webhook body is required",
        });
      }

      const signature =
        req.get("x-paystack-signature");

      const event =
        await this.webhookService.receive({
          provider: BillingProvider.PAYSTACK,
          signature,
          rawBody: req.rawBody,
          headers: req.headers,
        });

      return res.status(202).json({
        success: true,
        message: "Webhook received",
        eventId: event?.id,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Webhook processing failed";

      if (message === "Invalid webhook signature") {
        return res.status(401).json({ message });
      }

      return res.status(400).json({ message });
    }
  }

  async process(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const event =
        await this.webhookService.process(
          req.params.eventId
        );

      return res.status(200).json({
        message: "Webhook processed",
        event,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Webhook processing failed",
      });
    }
  }
}
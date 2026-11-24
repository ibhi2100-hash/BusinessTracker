import type { Request, Response } from "express";
import { BillingRequestType } from "../../../infrastructure/postgresql/prisma/generated/enums.js"; 
import { BillingSubscriptionService } from "../service/billing-subscription.service.js"; 

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
    role?: string;
  };
}

export class BillingSubscriptionController {
  constructor(
    private readonly subscriptionService: BillingSubscriptionService
  ) {}

  async current(
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

      const subscription =
        await this.subscriptionService.getCurrentSubscription(
          businessId
        );

      return res.status(200).json({
        subscription,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createRequest(
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
        requestedPlanId,
        requestedPlanVersion,
        requestType,
        subscriptionId,
      } = req.body;

      if (
        !requestedPlanId ||
        !Number.isInteger(Number(requestedPlanVersion)) ||
        !Object.values(BillingRequestType).includes(requestType)
      ) {
        return res.status(400).json({
          message: "Invalid subscription request details",
        });
      }

      const request =
        await this.subscriptionService.createRequest({
          businessId,
          requestedPlanId,
          requestedPlanVersion: Number(requestedPlanVersion),
          requestType,
          requestedBy: user.id,
          subscriptionId,
        });

      return res.status(201).json({
        message: "Subscription request submitted",
        request,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async approveRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const request =
        await this.subscriptionService.approveRequest({
          requestId: req.params.requestId,
          reviewerId: req.user.id,
          reason: req.body.reason,
        });

      return res.status(200).json({
        message: "Subscription request approved",
        request,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async rejectRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      if (!req.body.reason) {
        return res.status(400).json({
          message: "Rejection reason is required",
        });
      }

      const request =
        await this.subscriptionService.rejectRequest(
          req.params.requestId,
          req.user.id,
          req.body.reason
        );

      return res.status(200).json({
        message: "Subscription request rejected",
        request,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async cancelAtPeriodEnd(
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

      const subscription =
        await this.subscriptionService.cancelAtPeriodEnd(
          req.params.subscriptionId,
          businessId
        );

      return res.status(200).json({
        message: "Subscription cancellation scheduled",
        subscription,
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
          : "Subscription operation failed",
    });
  }
}
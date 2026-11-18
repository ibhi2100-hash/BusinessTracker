import type { Request, Response } from "express";
import { BillingPlanService } from "../services/billing-plan.service.js";

export class BillingPlanController {
  constructor(
    private readonly billingPlanService: BillingPlanService
  ) {}

  async listPublic(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plans =
        await this.billingPlanService.getPublicPlans();

      return res.status(200).json({ plans });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async listAdmin(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plans =
        await this.billingPlanService.getAdminPlans();

      return res.status(200).json({ plans });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async get(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plan =
        await this.billingPlanService.getPlanDetails(
          req.params.planId
        );

      if (!plan) {
        return res.status(404).json({
          message: "Billing plan not found",
        });
      }

      return res.status(200).json({ plan });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async create(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const {
        code,
        name,
        description,
        displayOrder,
        isFeatured,
      } = req.body;

      if (!code || !name) {
        return res.status(400).json({
          message: "Plan code and name are required",
        });
      }

      const plan =
        await this.billingPlanService.createPlan({
          code,
          name,
          description,
          displayOrder,
          isFeatured,
        });

      return res.status(201).json({
        message: "Billing plan created successfully",
        plan,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plan =
        await this.billingPlanService.updatePlan(
          req.params.planId,
          req.body
        );

      return res.status(200).json({
        message: "Billing plan updated successfully",
        plan,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async publish(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plan =
        await this.billingPlanService.publishPlan(
          req.params.planId
        );

      return res.status(200).json({
        message: "Billing plan published successfully",
        plan,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async retire(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const plan =
        await this.billingPlanService.retirePlan(
          req.params.planId
        );

      return res.status(200).json({
        message: "Billing plan retired successfully",
        plan,
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
          : "Billing plan operation failed",
    });
  }
}
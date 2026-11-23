
import type { Request, Response } from "express";

import { BillingPlanService } from "../service/billing-plan.service.js";

import {
  BillingPlanStatus,
  BillingCycle,
} from "../../../infrastructure/postgresql/prisma/generated/enums.js";

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
      const rawStatus = req.query.status;
      const rawSearch = req.query.search;
      const rawSkip = req.query.skip;
      const rawTake = req.query.take;

      let status: BillingPlanStatus | undefined;

      if (
        typeof rawStatus === "string" &&
        rawStatus.length > 0
      ) {
        const allowedStatuses = Object.values(BillingPlanStatus);

        if (
          !allowedStatuses.includes(
            rawStatus as BillingPlanStatus
          )
        ) {
          return res.status(400).json({
            message: "Invalid billing plan status",
          });
        }

        status = rawStatus as BillingPlanStatus;
      }

      const search =
        typeof rawSearch === "string"
          ? rawSearch
          : undefined;

      const skip =
        typeof rawSkip === "string"
          ? Number(rawSkip)
          : 0;

      const take =
        typeof rawTake === "string"
          ? Number(rawTake)
          : 20;

      if (
        !Number.isInteger(skip) ||
        skip < 0 ||
        !Number.isInteger(take) ||
        take < 1 ||
        take > 100
      ) {
        return res.status(400).json({
          message: "Invalid pagination parameters",
        });
      }

      const result =
        await this.billingPlanService.getAdminPlans({
          status,
          search,
          skip,
          take,
        });

      return res.status(200).json({
        plans: result.data,
        pagination: result.pagination,
      });
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
        priceMinor,
        currency,
        billingCycle,
        trialDays,
        limits,
        features,
      } = req.body;

      // Validate basic plan information.
      if (
        typeof code !== "string" ||
        !code.trim() ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          message: "Plan code and name are required",
        });
      }

      // Validate price.
      if (
        !(
          typeof priceMinor === "string" ||
          typeof priceMinor === "number"
        ) ||
        !/^\d+$/.test(String(priceMinor))
      ) {
        return res.status(400).json({
          message: "A valid priceMinor amount is required",
        });
      }

      // Validate currency.
      if (
        typeof currency !== "string" ||
        !/^[A-Za-z]{3}$/.test(currency)
      ) {
        return res.status(400).json({
          message: "A valid three-letter currency is required",
        });
      }

      // Validate billing cycle.
      const allowedBillingCycles = Object.values(BillingCycle);

      if (
        typeof billingCycle !== "string" ||
        !allowedBillingCycles.includes(
          billingCycle as BillingCycle
        )
      ) {
        return res.status(400).json({
          message: "Invalid billing cycle",
        });
      }

      // Validate limits.
      if (
        !limits ||
        typeof limits !== "object" ||
        Array.isArray(limits)
      ) {
        return res.status(400).json({
          message: "Plan limits are required",
        });
      }

      const {
        maxStaff,
        maxBranches,
        maxProducts,
      } = limits;

      const numericLimits = [
        maxStaff,
        maxBranches,
        maxProducts,
      ];

      if (
        numericLimits.some(
          (value) =>
            !Number.isInteger(value) ||
            value < 0
        )
      ) {
        return res.status(400).json({
          message:
            "Staff, branch, and product limits must be non-negative integers",
        });
      }

      // Validate trial days.
      const normalizedTrialDays = trialDays ?? 0;

      if (
        !Number.isInteger(normalizedTrialDays) ||
        normalizedTrialDays < 0
      ) {
        return res.status(400).json({
          message: "Trial days must be a non-negative integer",
        });
      }

      // Validate features.
      if (
        !features ||
        typeof features !== "object" ||
        Array.isArray(features)
      ) {
        return res.status(400).json({
          message: "Plan features must be an object",
        });
      }

      // Construct the initial version before calling the service.
      const initialVersion = {
        priceMinor: BigInt(String(priceMinor)),
        currency: currency.toUpperCase(),
        billingCycle: billingCycle as BillingCycle,
        intervalCount: 1,
        trialDays: normalizedTrialDays,

        maxStaff,
        maxBranch: maxBranches,
        maxProduct: maxProducts,

        features,
      };

      // Create plan and initial version atomically through the service.
      const plan =
        await this.billingPlanService.createPlan({
          code: code.trim(),
          name: name.trim(),
          description:
            typeof description === "string"
              ? description
              : null,
          displayOrder: displayOrder ?? 0,
          isFeatured: isFeatured ?? false,
          initialVersion,
        });

      // Serialize BigInt fields before returning JSON.
      const serializedPlan = {
        ...plan,
        versions: plan.versions.map((version) => ({
          ...version,
          priceMinor: version.priceMinor.toString(),
        })),
      };

      return res.status(201).json({
        message: "Billing plan created successfully",
        plan: serializedPlan,
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
    const message =
      error instanceof Error
        ? error.message
        : "Billing plan operation failed";

    return res.status(400).json({ message });
  }
}

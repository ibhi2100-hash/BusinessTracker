import type { Request, Response } from "express";
import { CashflowService } from "../service/cashflow.service.js";
import { CashFlowType } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class CashflowController {
  constructor(private cashflowService: CashflowService) {}

  // POST /cashflow/opening
  async addOpeningCash(req: Request, res: Response) {
    try {
      const { businessId, branchId } = req.user!;
      const { amount } = req.body;

      if (typeof amount !== "number" || amount <= 0)
        return res.status(400).json({ message: "Amount must be positive" });

      const openingCash = await this.cashflowService.addOpeningCash(
        businessId,
        branchId,
        amount
      );

      return res.status(201).json({ message: "Opening cash added", data: openingCash });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // POST /cashflow/inject (owner top-up)
  async injectCash(req: Request, res: Response) {
    try {
      const { businessId, branchId } = req.user!;
      const { amount, type, description } = req.body as {
        amount: number;
        type: CashFlowType;
        description?: string;
      };

      if (typeof amount !== "number" || amount <= 0)
        return res.status(400).json({ message: "Amount must be positive" });

      const injection = await this.cashflowService.injectCash(
        businessId,
        branchId,
        amount,
        type,
        description
      );

      return res.status(201).json({ message: "Cash injected successfully", data: injection });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // POST /cashflow/withdraw
  async withdrawCash(req: Request, res: Response) {
    try {
      const { businessId, branchId } = req.user!;
      const { amount, type, description } = req.body as {
        amount: number;
        type: CashFlowType;
        description?: string;
      };

      if (typeof amount !== "number" || amount <= 0)
        return res.status(400).json({ message: "Amount must be positive" });

      const withdrawal = await this.cashflowService.withdrawCash(
        businessId,
        branchId,
        amount,
        type,
        description
      );

      return res.status(201).json({ message: "Cash withdrawn", data: withdrawal });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // GET /cashflow
  async getCashflowRecord(req: Request, res: Response) {
    try {
      const { businessId, branchId } = req.user!;
      const records = await this.cashflowService.getCashflowRecord(businessId, branchId);
      return res.status(200).json(records);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // GET /cashflow/dailySummary
  async getDailySummary(req: Request, res: Response) {
    try {
      const { businessId, branchId } = req.user;
      const dateParam = req.query.date as string | undefined;
      const date = dateParam ? new Date(dateParam) : new Date();

      if (isNaN(date.getTime()))
        return res.status(400).json({ message: "Invalid date format" });

      const summary = await this.cashflowService.getDailySummary(
        businessId,
        branchId,
        date
      );
      return res.status(200).json(summary);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown) {
    console.error(error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
}
import type { Request, Response } from "express";
import { ReportService } from "../service/report.service.js";
import { ReportPeriodDto } from "../dto/report-period.dto.js";

export class ReportController {
  constructor(private reportService: ReportService) {}

  // ------------------------
  // Helper: parse branchId + dates safely
  // ------------------------
  private parseBranchAndDates(req: Request) {
    const startRaw = req.query.startDate;
    const endRaw = req.query.endDate;

    const startStr = typeof startRaw === "string" ? startRaw : undefined;
    const endStr = typeof endRaw === "string" ? endRaw : undefined;

    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = endStr ? new Date(endStr) : new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    return { period: { startDate, endDate } as ReportPeriodDto };
  }

  // ------------------------
  // Helper: get businessId + branchId
  // ------------------------
  private getBusinessAndBranch(req: Request) {
    const businessId = req.user?.businessId;
    const branchId = req.user?.branchId;

    if (!businessId)
      throw new Error("Business ID is required");

    if (!branchId)
      throw new Error("Branch ID is required");

    return { businessId, branchId };
  }

  // ------------------------
  // Profit & Loss
  // ------------------------
  async profitAndLoss(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const report = await this.reportService.profitAndLoss(
        businessId,
        branchId,
        period
      );

      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Cashflow report
  // ------------------------
  async cashflow(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const report = await this.reportService.cashflow(
        businessId,
        branchId,
        period
      );

      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Balance Sheet
  // ------------------------
  async balanceSheet(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);

      const report = await this.reportService.balanceSheet(
        businessId,
        branchId
      );

      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Business Summary
  // ------------------------
  async summary(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const report = await this.reportService.businessSummary(
        businessId,
        branchId,
        period
      );

      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Dashboard Summary
  // ------------------------
  async dashboardSummary(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const report = await this.reportService.dashboardSummary(
        businessId,
        branchId,
        period
      );

      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Today's Sales
  // ------------------------
  async todaySales(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);

      const todaySales = await this.reportService.getTodaySales(
        businessId,
        branchId
      );

      res.json({ todaySales });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Cash at Hand
  // ------------------------
  async cashAtHand(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);

      const balance = await this.reportService.cashAtHand(
        businessId,
        branchId
      );

      res.json({ cashAtHand: balance });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Sales Trend for Charts
  // ------------------------
  async salesTrend(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const trend = await this.reportService.salesTrend(
        businessId,
        branchId,
        period
      );

      res.json(trend);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Expense Breakdown for Charts
  // ------------------------
  async expenseBreakdown(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const breakdown = await this.reportService.expenseBreakdown(
        businessId,
        branchId,
        period
      );

      res.json(breakdown);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // ------------------------
  // Top Products for Charts
  // ------------------------
  async topProducts(req: Request, res: Response) {
    try {
      const { businessId, branchId } = this.getBusinessAndBranch(req);
      const { period } = this.parseBranchAndDates(req);

      const top = await this.reportService.topProducts(
        businessId,
        branchId,
        period
      );

      res.json(top);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
  async dashboard(req: Request, res: Response) {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) return res.status(400).json({ message: "Business ID is required" });

    const branchId = req.user?.branchId;
    if (!branchId) return res.status(400).json({ message: "Branch ID is required" });

    const { period } = this.parseBranchAndDates(req);

    const data = await this.reportService.getDashboardData(businessId, branchId, period);

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
}
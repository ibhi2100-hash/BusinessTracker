import type { Request, Response } from "express";
import { ReportService } from "../service/report.service.js";
import { ReportPeriodDto } from "../dto/report-period.dto.js";

export class ReportController {
  constructor(private reportService: ReportService) {}

  // Helper to parse branchId and query dates safely
  private parseBranchAndDates(req: Request) {
   
    // --- Dates from query ---
    const startRaw = req.query.startDate;
    const endRaw = req.query.endDate;

    // Only use strings, ignore objects
    const startStr = typeof startRaw === "string" ? startRaw : undefined;
    const endStr = typeof endRaw === "string" ? endRaw : undefined;

    // Convert to Date safely
    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = endStr ? new Date(endStr) : new Date();
    endDate.setUTCHours(23, 59, 59, 999);
   

    return { period: { startDate, endDate } as ReportPeriodDto };
  }

  async profitAndLoss(req: Request, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ message: "Business ID is required" });

      const branchId = req.user?.branchId;
      if(!branchId){
        return res.status(400).json({ message: "Branch id does not exist"})
      }

      const { period } = this.parseBranchAndDates(req);

      const report = await this.reportService.profitAndLoss(businessId, branchId, period);
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async cashflow(req: Request, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ message: "Business ID is required" });

            const branchId = req.user?.branchId;
                if(!branchId){
                    return res.status(400).json({ message: "Branch id does not exist"})
                }

      const {period } = this.parseBranchAndDates(req);

      const report = await this.reportService.cashflow(businessId, branchId, period);
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async balanceSheet(req: Request, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ message: "Business ID is required" });

        const branchId = req.user?.branchId;
      if(!branchId){
        return res.status(400).json({ message: "Branch id does not exist"})}

      const report = await this.reportService.balanceSheet(businessId, branchId);
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async summary(req: Request, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ message: "Business ID is required" });

            const branchId = req.user?.branchId;
      if(!branchId){
        return res.status(400).json({ message: "Branch id does not exist"})}

      const { period } = this.parseBranchAndDates(req);
      console.log("branchID",branchId, "periode", period)

      const report = await this.reportService.businessSummary(businessId, branchId, period);
      console.log(report)
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
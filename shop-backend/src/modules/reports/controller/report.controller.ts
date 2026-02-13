import type { Request, Response } from "express";
import { ReportService } from "../service/report.service.js";

const reportService = new ReportService();

export class ReportController{
    async profitAndLoss(req: Request, res: Response){
        const businessId = req.user!.businessId!;
        const report = await reportService.profitAndLoss(businessId, req.body);

        res.json(report)
    }

    async cashflow(req: Request, res: Response){
        const businessId = req.user!.businessId!;
        const report = await reportService.cashflow(businessId, req.body);

        res.json(report);

    }

    async balanceSheet(req: Request, res: Response){
        const businessId = req.user!.businessId!;
        const report = await reportService.balanceSheet(businessId);

        res.json(report);
    }

    async summary(req: Request, res: Response){
        const businessId = req.user!.businessId!;
        const report = await reportService.businessSummary(businessId, req.body);

        res.json(report)
    }
}
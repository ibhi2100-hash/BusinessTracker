import type { Request, Response } from "express";
import { CashflowService } from "../service/cashflow.service.js";



export class CashflowController {
    constructor (private cashflowService: CashflowService){};
    // POST /cashflow/opening
    async addOpeningCash(req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;
            const { amount } = req.body;

            if (!businessId) {
                return res.status(401).json({ message: "Unauthorized: Business not found" });
            }

            if (!branchId) {
                return res.status(400).json({ message: "BranchId does not exist" });
            }

            if (!amount || typeof amount !== "number") {
                return res.status(400).json({ message: "Amount must be provided and be a number" });
            }

            const openingCash = await this.cashflowService.addOpeningCash(
                businessId,
                branchId,
                amount
            );

            return res.status(201).json({
                message: "Opening cash added successfully",
                data: openingCash
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error"
            });
        }
    }

    // Optional: GET /cashflow/daily-summary?date=YYYY-MM-DD
    async getDailySummary(req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;
            const dateParam = req.query.date as string;
            const date = dateParam ? new Date(dateParam) : new Date();

            if (!businessId) {
                return res.status(401).json({ message: "Unauthorized: Business not found" });
            }
            if (!branchId) {
                return res.status(400).json({ message: "BranchId does not exist" });
            }

            const summary = await this.cashflowService.getDailySummary(businessId, branchId, date);

            return res.status(200).json(summary);

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error"
            });
        }
    }

    async withdrawCash (req: Request, res: Response){

    }
    
    async getCashflowRecord (req: Request, res: Response) {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;

            if (!businessId) {
                return res.status(401).json({ message: "Unauthorized: Business not found" });
            }

            if (!branchId) {
                return res.status(400).json({ message: "BranchId does not exist" });
            }

            const getCashflowInjection = await this.cashflowService.getCashflowInject(businessId, branchId)

            console.log(getCashflowInjection)

            return res.json(getCashflowInjection)

    }

}
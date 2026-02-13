import { ReportRepository } from "../repository/report.repository.js";
import { ReportPeriodDto } from "../dto/report-period.dto.js";
import { addAbortListener } from "node:events";

export class ReportService {
    private reportRepo = new ReportRepository();

    async profitAndLoss(businessId: string, period: ReportPeriodDto){
        const revenue = await this.reportRepo.getRevenue(
            businessId,
            period.startDate,
            period.endDate
        );

        //Simplified COGS (can be expanded later)
        const cogs = 0;

        const grossProfit = revenue - cogs;

        const cashflow = await this.reportRepo.getCashflow(
            businessId,
            period.startDate,
            period.endDate
        );

        const netProfit = grossProfit - cashflow.outflow;

        return { 
            revenue,
            costOfGoodsSold: cogs,
            grossProfit,
            operatingExpenses: cashflow.outflow,
            netProfit,
        };
    }

    async cashflow(businessId: string, period: ReportPeriodDto){
        const flow = await this.reportRepo.getCashflow(
            businessId,
            period.startDate,
            period.endDate,
        );

        return {
            inflow: flow.inflow,
            outflow: flow.outflow,
            netCashflow: flow.inflow - flow.outflow,
        };
    }

    async balanceSheet(businessId: string){
        const assets = await this.reportRepo.getAssets(businessId);
        const liabilities = await this.reportRepo.getLiabilities(businessId);


        return {
            assets,
            liabilities,
            equity: assets - liabilities,
        };
    }

    async businessSummary(businessId: string, period: ReportPeriodDto){
        const revenue = await this.reportRepo.getRevenue(
            businessId,
            period.startDate,
            period.endDate,
        );

        const liabilities = await this.reportRepo.getLiabilities(businessId);
        const inventoryValue = await this.reportRepo.getInventoryValue(businessId);
        const assets = await this.reportRepo.getAssets(businessId);


        return { 
            revenue,
            profit: revenue,
            cashBalance: assets,
            inventoryValue,
            outstandingLiabilities: liabilities
        }
    }
}
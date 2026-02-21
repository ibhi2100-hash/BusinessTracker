import { ReportRepository } from "../repository/report.repository.js";
import { ReportPeriodDto } from "../dto/report-period.dto.js";
import { addAbortListener } from "node:events";

export class ReportService {
   constructor( private reportRepo: ReportRepository){};

    async profitAndLoss(businessId: string,branchId: string,  period: ReportPeriodDto){
        const revenue = await this.reportRepo.getRevenue(
            businessId,
            branchId,
            period.startDate,
            period.endDate
        );

        //Simplified COGS (can be expanded later)
        const cogs =  await this.reportRepo.getCOGS(
            businessId,
            branchId,
            period.startDate,
            period.endDate
        )

        const grossProfit = revenue - cogs;

        const cashflow = await this.reportRepo.getCashflow(
            businessId,
            branchId,
            period.startDate,
            period.endDate
        );

        const operatingExpenses = await this.reportRepo.getOperatingExpenses(
            businessId,
            branchId,
            period.startDate,
            period.endDate,
        )

        const netProfit = grossProfit - operatingExpenses;

        return { 
            revenue,
            costOfGoodsSold: cogs,
            grossProfit,
            operatingExpenses: cashflow.outflow,
            netProfit,
        };
    }

    async cashflow(businessId: string,branchId: string, period: ReportPeriodDto){
        const flow = await this.reportRepo.getCashflow(
            businessId,
            branchId,
            period.startDate,
            period.endDate,
        );

        return {
            inflow: flow.inflow,
            outflow: flow.outflow,
            netCashflow: flow.inflow - flow.outflow,
        };
    }
    

    async balanceSheet(businessId: string, branchId: string){
        const assets = await this.reportRepo.getAssets(businessId, branchId);
        const liabilities = await this.reportRepo.getLiabilities(businessId, branchId);


        return {
            assets,
            liabilities,
            equity: assets - liabilities,
        };
    }

    async businessSummary(businessId: string, branchId: string, period: ReportPeriodDto){
        const revenue = await this.reportRepo.getRevenue(
            businessId,
            branchId,
            period.startDate,
            period.endDate,
        );

        const liabilities = await this.reportRepo.getLiabilities(businessId, branchId);
        const inventoryValue = await this.reportRepo.getInventoryValue(businessId, branchId);
        const assets = await this.reportRepo.getAssets(businessId, branchId);
        const DebtRatio = liabilities / assets


        return { 
            revenue,
            profit: revenue,
            assets: assets,
            inventoryValue,
            outstandingLiabilities: liabilities
        }
    }
     async getTodaySales(businessId: string, branchId: string) {
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        return this.reportRepo.getRevenue(businessId, branchId, todayStart, new Date());
        }
}
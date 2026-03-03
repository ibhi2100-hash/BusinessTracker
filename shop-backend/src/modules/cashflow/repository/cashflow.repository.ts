import { join } from "node:path";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CashFlowType } from "../../../infrastructure/postgresql/prisma/generated/client.js";


export class CashflowRepository{
    async inflow(data: any, tx: Prisma.TransactionClient){
        return tx.cashFlow.create({data})
    }
    async outflow(data: any, tx: Prisma.TransactionClient){
        return tx.cashFlow.create({data})
    }
    async getDailySummary(
        businessId: string,
        date: Date
    ) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const flows = await prisma.cashFlow.groupBy({
            by: ["direction"],
            where: {
                businessId,
                createdAt: {
                    gte: start,
                    lte: end
                },
            },
            _sum: {
                amount: true,
            },
        });

        let inflow = 0;
        let outflow = 0;

        for (const row of flows) {
            if(row.direction === "IN") inflow = Number(row._sum.amount ?? 0);
            if(row.direction === "OUT") outflow = Number(row._sum.amount ?? 0)
        }
        return {
            date: start.toISOString().slice(0, 10),
            inflow,
            outflow,
            net: inflow - outflow
        }
    };


    async create(
        data: Prisma.CashFlowCreateInput,
        tx: Prisma.TransactionClient
    ) {
        return tx.cashFlow.create({ data });
    }

    async getOPeningCashflowInject(businessId: string, branchId: string) {
        return prisma.cashFlow.findMany({
            where: {
                businessId,
                branchId,
                type: "OPENING",
            }
        })
    }
    async getCashflowInject(business: string, branchId: string) {
        
    }

    
}
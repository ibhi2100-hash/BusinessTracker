import { join } from "node:path";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

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
            by: ["type"],
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
            if(row.type === "INFLOW") inflow = Number(row._sum.amount ?? 0);
            if(row.type === "OUTFLOW") outflow = Number(row._sum.amount ?? 0)
        }
        return {
            date: start.toISOString().slice(0, 10),
            inflow,
            outflow,
            net: inflow - outflow
        }
    };

    
}
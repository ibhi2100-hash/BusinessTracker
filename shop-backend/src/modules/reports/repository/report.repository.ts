import { prisma  } from "../../../infrastructure/postgresql/prismaClient.js";

export class ReportRepository{
    async getRevenue( businessId: string, start: Date, end: Date) {
        const result = await prisma.sale.aggregate({
            where: {
                businessId,
                createdAt: { gte: start, lte: end},
                status: "COMPLETED"
            },
            _sum: { totalAmount: true}
        });
        return Number(result._sum.totalAmount ?? 0);
    }


    async getCashflow(businessId: string, start: Date, end: Date){
        const result = await prisma.cashFlow.groupBy({
            by: ["type"],
            where: {
                businessId,
                createdAt: {gte: start, lte: end},
            },
            _sum: { amount: true}
        });

        return result.reduce(
            (acc, row) => {
                if(row.type === "INFLOW") acc.inflow += Number(row._sum.amount)
                if(row.type === "OUTFLOW") acc.outflow += Number(row._sum.amount);
                return acc;
            },
            { inflow: 0, outflow: 0}
        );
    }

    async getInventoryValue( businessId: string) {
        const result = await prisma.product.aggregate({
            where: {
                businessId,
                isActive: true,
            },
            _sum: {
                costPrice: true,
            }
        });
        return Number(result._sum.costPrice ?? 0)
    }

    async getLiabilities(businessId: string) {
        const result = await prisma.liability.aggregate({
            where: {
                businessId,
                status: "ACTIVE"
            },
            _sum: {
                outstandingAmount: true,
            }
        });
        return Number(result._sum.outstandingAmount ?? 0);
    }

    async getAssets(businessId: string) {
        const result = await prisma.asset.aggregate({
            where: {
                businessId,
            },
            _sum: {currentValue: true}
        });
        return Number(result._sum.currentValue ?? 0)
    }
}
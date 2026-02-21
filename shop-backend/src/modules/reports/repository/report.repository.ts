import { prisma  } from "../../../infrastructure/postgresql/prismaClient.js";

export class ReportRepository{
    async getRevenue( businessId: string,branchId: string, start: Date, end: Date) {
        const result = await prisma.sale.aggregate({
            where: {
                businessId,
                branchId,
                createdAt: { gte: start, lte: end},
                status: "COMPLETED"
            },
            _sum: { totalAmount: true}
        });
        return Number(result._sum.totalAmount ?? 0);
    }


    async getCashflow(businessId: string, branchId: string, start: Date, end: Date){
        const result = await prisma.cashFlow.groupBy({
            by: ["type"],
            where: {
                businessId,
                branchId,
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

    async getInventoryValue(businessId: string, branchId: string) {
        const products = await prisma.product.findMany({
            where: { businessId, branchId, isActive: true },
            select: { quantity: true, costPrice: true }
        });

        return products.reduce(
            (sum, p) => {
                const cost = Number(p.costPrice ?? 0);
                const qty = Number(p.quantity ?? 0)
                
                return sum + cost * qty
            },
            0
        );
        }

    async getLiabilities(businessId: string, branchId: string) {
        const result = await prisma.liability.aggregate({
            where: {
                businessId,
                branchId,
                status: "ACTIVE"
            },
            _sum: {
                outstandingAmount: true,
            }
        });
        return Number(result._sum.outstandingAmount ?? 0);
    }
    async getCOGS(businessId: string, branchId: string, start: Date, end: Date) {
        const result = await prisma.saleItem.aggregate({
            where: {
            sale: {
                businessId,
                branchId,
                createdAt: { gte: start, lte: end },
                status: "COMPLETED"
            }
            },
            _sum: {
            costPrice: true,   // OR costAtSale
            quantity: true
            }
        });

        return Number(result._sum.costPrice ?? 0);
        }

    async getAssets(businessId: string, branchId: string) {
        const result = await prisma.asset.aggregate({
            where: {
                businessId,
                branchId
            },
            _sum: {currentValue: true}
        });
        return Number(result._sum.currentValue ?? 0)
    }
    async getOperatingExpenses(
        businessId: string,
        branchId: string,
        start: Date,
        end: Date
        ) {
        const result = await prisma.expense.aggregate({
            where: {
            businessId,
            branchId,
            createdAt: { gte: start, lte: end },
            },
            _sum: { amount: true }
        });

        return Number(result._sum.amount ?? 0);
        }


       

}
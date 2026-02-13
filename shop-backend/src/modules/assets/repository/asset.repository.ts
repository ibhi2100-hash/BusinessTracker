import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class AssetRepository {

    async create(businessId: string, data: {
        name: string;
        category: string;
        purchaseCost: number;
        quantity: number;
        purchaseDate: Date;
        usefulLifeMonths: number;
        salvageValue?: number;
        supplier?: string;
        condition?: string;

        // 👇 PRE-CALCULATED VALUES
        totalCost: number;
        accumulatedDepreciation: number;
        currentValue: number;
    }) {
        return prisma.asset.create({
            data: {
                businessId,
                ...data,
            },
        });
    }

    async list(businessId: string) {
        return prisma.asset.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
        });
    }

    async findById(assetId: string, businessId: string) {
        return prisma.asset.findFirst({
            where: {
                id: assetId,
                businessId,
            },
        });
    }

    async dispose(
        assetId: string,
        businessId: string,
        data: {
            disposedAt: Date;
            disposalAmount?: number;
        }
    ) {
        return prisma.asset.update({
            where: { id: assetId },
            data: {
                disposedAt: data.disposedAt,
                disposalAmount: data.disposalAmount ?? null,
            },
        });
    }
}


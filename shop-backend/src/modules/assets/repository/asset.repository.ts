import { AssetType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class AssetRepository {

async create(
  businessId: string,
  branchId: string,
  data: {
    name: string;
    purchaseCost: number;
    quantity: number;
    purchaseDate: Date;
    usefulLifeMonths: number;
    salvageValue?: number;
    assetType: AssetType;
    supplier?: string;
    condition?: string;

    totalCost: number;
    accumulatedDepreciation: number;
    currentValue: number;
  }
) {
  const assetData: Prisma.AssetUncheckedCreateInput = {
    businessId,
    branchId,

    name: data.name,
    purchaseCost: data.purchaseCost,
    quantity: data.quantity,
    purchaseDate: data.purchaseDate,
    usefulLifeMonths: data.usefulLifeMonths,

    assetType: data.assetType,

    totalCost: data.totalCost,
    accumulatedDepreciation: data.accumulatedDepreciation,
    currentValue: data.currentValue,

    salvageValue: data.salvageValue ?? null,
    supplier: data.supplier ?? null,
    condition: data.condition ?? null,
  };

  return prisma.asset.create({
    data: assetData,
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


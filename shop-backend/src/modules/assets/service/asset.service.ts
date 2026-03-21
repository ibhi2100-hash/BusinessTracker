import { PrismaClient } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { CreateAssetDto } from "../dto/create-asset.dto.js";
import { DisposeAssetDto } from "../dto/dispose-asset.dto.js";
import { AssetRepository } from "../repository/asset.repository.js";

export class AssetService {
  private assetRepo = new AssetRepository();

  async createAsset(
    businessId: string,
    branchId: string,
    dto: CreateAssetDto,
    tx: PrismaClient
  ) {

    if (dto.purchaseCost <= 0) {
      throw new Error("Purchase cost must be greater than zero");
    }

    if (dto.usefulLifeMonths <= 0) {
      throw new Error("Useful life must be greater than zero");
    }

    const business = await tx.business.findUnique({
      where: { id: businessId },
      select: { isOnboarding: true }
    });

    if (!business) {
      throw new Error("Business not found");
    }

    if (business.isOnboarding && dto.assetType !== "OPENING") {
      throw new Error("Only OPENING assets allowed during onboarding");
    }

    if (!business.isOnboarding && dto.assetType !== "PURCHASE") {
      throw new Error("Opening assets not allowed after activation");
    }

    const purchaseDate = dto.purchaseDate ?? new Date();

    const {
      totalCost,
      accumulatedDepreciation,
      currentValue,
    } = this.calculateDepreciation({
      purchaseCost: dto.purchaseCost,
      quantity: dto.quantity,
      usefulLifeMonths: dto.usefulLifeMonths,
      salvageValue: dto.salvageValue ?? 0,
      purchaseDate,
    });

    return tx.asset.create({
      data: {
        id: dto.id,
        businessId,
        branchId,

        name: dto.name,
        purchaseCost: dto.purchaseCost,
        quantity: dto.quantity,
        usefulLifeMonths: dto.usefulLifeMonths,

        salvageValue: dto.salvageValue ?? null,
        supplier: dto.supplier ?? null,
        condition: dto.condition ?? null,

        assetType: dto.assetType,
        purchaseDate,

        totalCost,
        accumulatedDepreciation,
        currentValue,

        isOpeninig: dto.assetType === "OPENING",
      }
    });
  }

  async disposeAsset(
    assetId: string,
    businessId: string,
    branchId: string,
    dto: DisposeAssetDto,
    tx: PrismaClient
  ) {

    const asset = await tx.asset.findFirst({
      where: { id: assetId, businessId }
    });

    if (!asset || asset.disposedAt) {
      throw new Error("Asset not found or already disposed");
    }

    return tx.asset.update({
      where: { id: assetId },
      data: {
        disposedAt: dto.disposedAt ?? new Date(),
        disposalAmount: dto.disposalAmount,
      },
    });
  }

  private calculateDepreciation(params: {
    purchaseCost: number;
    quantity: number;
    usefulLifeMonths: number;
    salvageValue?: number;
    purchaseDate: Date;
  }) {

    const totalCost = params.purchaseCost * params.quantity;
    const salvageValue = params.salvageValue ?? 0;

    const depreciableAmount = totalCost - salvageValue;
    const monthlyDepreciation =
      depreciableAmount / params.usefulLifeMonths;

    const monthsUsed = this.monthDiff(
      params.purchaseDate,
      new Date()
    );

    const accumulatedDepreciation =
      Math.min(monthsUsed, params.usefulLifeMonths) *
      monthlyDepreciation;

    const currentValue = Math.max(
      totalCost - accumulatedDepreciation,
      salvageValue
    );

    return {
      totalCost,
      accumulatedDepreciation,
      currentValue,
    };
  }

  private monthDiff(start: Date, end: Date) {
    return (
      end.getFullYear() * 12 +
      end.getMonth() -
      (start.getFullYear() * 12 + start.getMonth())
    );
  }
}
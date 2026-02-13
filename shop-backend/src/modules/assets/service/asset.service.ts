import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { CreateAssetDto } from "../dto/create-asset.dto.js";
import { DisposeAssetDto } from "../dto/dispose-asset.dto.js";
import { AssetRepository } from "../repository/asset.repository.js";

export class AssetService {
    private assetRepo = new AssetRepository();

    /* ==========================
       CREATE ASSET
    ========================== */
    async createAsset(businessId: string, dto: CreateAssetDto) {

        if (dto.purchaseCost <= 0) {
            throw new Error("Purchase cost must be greater than zero");
        }

        if (dto.usefulLifeMonths <= 0) {
            throw new Error("Useful life must be greater than zero");
        }

        const purchaseDate = dto.purchaseDate ?? new Date();

        // 1️⃣ Calculate asset values
        const {
            totalCost,
            accumulatedDepreciation,
            currentValue,
        } = this.calculateDepreciation({
            purchaseCost: dto.purchaseCost,
            quantity: dto.quantity,
            usefulLifeMonths: dto.usefulLifeMonths,
            ...(dto.salvageValue !== undefined ? { salvageValue: dto.salvageValue } : {}),
            purchaseDate,
        });

        // 2️⃣ Persist asset
        const asset = await this.assetRepo.create(businessId, {
            ...dto,
            purchaseDate,
            totalCost,
            accumulatedDepreciation,
            currentValue,
        });

        // 3️⃣ Cashflow (OUTFLOW)
        await prisma.cashFlow.create({
            data: {
                businessId,
                type: "OUTFLOW",
                amount: totalCost,
                source: "ASSET_PURCHASE",
                description: `Asset purchase: ${asset.name}`,
            },
        });

        return asset;
    }

    /* ==========================
       LIST ASSETS
    ========================== */
    async listAssets(businessId: string) {
        return this.assetRepo.list(businessId);
    }

    /* ==========================
       DISPOSE ASSET
    ========================== */
    async disposeAsset(
        assetId: string,
        businessId: string,
        dto: DisposeAssetDto
    ) {
        const asset = await this.assetRepo.findById(assetId, businessId);

        if (!asset || asset.disposedAt) {
            throw new Error("Asset not found or already disposed");
        }

        const disposedAt = dto.disposedAt ?? new Date();

        // 1️⃣ Mark asset as disposed
        const disposedAsset = await this.assetRepo.dispose(assetId, businessId, {
            disposedAt,
            disposalAmount: dto.disposalAmount,
        });

        // 2️⃣ Cashflow (INFLOW) if money received
        if (dto.disposalAmount && dto.disposalAmount > 0) {
            await prisma.cashFlow.create({
                data: {
                    businessId,
                    type: "INFLOW",
                    amount: dto.disposalAmount,
                    source: "ASSET_DISPOSAL",
                    description: `Asset disposal: ${asset.name}`,
                },
            });
        }

        return disposedAsset;
    }

    /* ==========================
       DEPRECIATION LOGIC
    ========================== */
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

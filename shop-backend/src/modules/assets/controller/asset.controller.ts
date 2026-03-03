import type { Request, Response } from "express";
import { AssetService } from "../service/asset.service.js";

const assetService = new AssetService();

export class AssetController {

    async createAsset(req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;

            if (!businessId) {
                return res.status(401).json({
                    message: "Unauthorized: Business not found",
                });
            }

            if (!branchId) {
                return res.status(400).json({
                    message: "BranchId does not exist",
                });
            }

            const asset = await assetService.createAsset(
                businessId,
                branchId,
                req.body
            );

            return res.status(201).json(asset);

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;

            if (!businessId) {
                return res.status(401).json({
                    message: "Unauthorized: Business not found",
                });
            }

            const assets = await assetService.listAssets(businessId);

            return res.status(200).json(assets);

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }

    async dispose(req: Request, res: Response) {
        try {
            const businessId = req.user?.businessId;
            const branchId = req.user?.branchId;

            if (!businessId) {
                return res.status(401).json({
                    message: "Unauthorized: Business not found",
                });
            }

            if (!branchId) {
                return res.status(400).json({
                    message: "BranchId does not exist",
                });
            }

            const { assetId } = req.params;

            if (!assetId) {
                return res.status(400).json({
                    message: "Invalid assetId",
                });
            }
             if(Array.isArray(assetId)){
                return res.status(400).json({ message: "asset ID is a string"})
            }

            const result = await assetService.disposeAsset(
                assetId,
                businessId,
                branchId,
                req.body
            );

            return res.status(200).json({
                message: "Asset disposed successfully",
                data: result,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error instanceof Error ? error.message : "Internal Server Error",
            });
        }
    }
}
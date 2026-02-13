import type { Request, Response } from "express";
import { AssetService } from "../service/asset.service.js";

const assetService = new AssetService();

export class AssetController {
   
async createAsset(req: Request, res: Response){
    try {
    const businessId = req.user!.businessId!;

    if(!businessId){
        return res.status(401).json({message: "Invalid BusinessId or not registered"})
    }

    const asset = await assetService.createAsset(businessId, req.body);

    res.status(201).json(asset)

}
    catch(error){
        console.error(error)
        error instanceof Error ? error.message : String(error)
    };
    
    }

    async list(req: Request, res: Response ){
        try {
            const businessId = req.user!.businessId!;

            if(!businessId){
                return res.status(401).json({message: "Invalid BusinessId or not registered"})
            }

            const asset = await assetService.listAssets(businessId);
            res.status(201).json(asset)

            
        } catch (error) {
            console.error(error);
            error instanceof Error ? error.message : String(error)
        }
    }

    async dispose(req: Request, res: Response) {
        try {
            const businessId = req.user!.businessId!;

            if(!businessId){
                return res.status(401).json({message: "Invalid BusinessId or not registered"})
            }

            const { assetId } = req.params;

            if (!assetId || Array.isArray(assetId)) {
                return res.status(400).json({ message: "Invalid assetId" });
            }

            const result = await assetService.disposeAsset(assetId, businessId, req.body)
            
            return res.status(200).json({message: "Asset Disposed",result});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
        }
    }

}
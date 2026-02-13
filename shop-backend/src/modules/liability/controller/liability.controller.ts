import { Request, Response } from "express";
import { LiabilityService } from "../service/liability.service.js";

const service = new LiabilityService();

export class LiabilityController {

    async create(req: Request, res: Response) {
        const businessId = req.user!.businessId!;
        const liability = await service.creatLiability(businessId, req.body);
        res.status(201).json(liability);
    }

    async list(req: Request, res: Response) {
        const businessId = req.user!.businessId!;
        const liabilities = await service.listLiabilities(businessId);
        res.json(liabilities);
    }

    async repay(req: Request, res: Response) {
        const businessId = req.user!.businessId!;
        const rawId = req.params.liabilityId;
        const liabilityId = Array.isArray(rawId) ? rawId[0] : rawId;
        if(!liabilityId) {
            return res.status(400).json({ message: "LiabilityId does not exist" });
        }
        const result = await service.repayLiability(liabilityId, businessId, req.body);
        res.json(result);
    }
}

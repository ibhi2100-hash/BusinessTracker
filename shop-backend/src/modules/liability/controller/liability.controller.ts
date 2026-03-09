import { Request, Response } from "express";
import { LiabilityService } from "../service/liability.service.js";
import { BranchScalarFieldEnum } from "../../../infrastructure/postgresql/prisma/generated/internal/prismaNamespace.js";


export class LiabilityController {
  constructor(private liabilityService: LiabilityService) {}

  create = async (req: Request, res: Response) => {
    const businessId = req.user.businessId;
    const branchId = req.user?.branchId;

    if (!businessId) return res.status(401).json({ message: "Business is not found" });
    if (!branchId) return res.status(401).json({ message: "Branch ID is not found" });
    const dto = req.body.input ?? req.body

    const liability = await this.liabilityService.createLiability(businessId, branchId, dto);
    return res.status(201).json(liability);
  };

  list = async (req: Request, res: Response) => {
    const businessId = req.user!.businessId!;
    const liabilities = await this.liabilityService.listLiabilities(businessId);
    res.json(liabilities);
  };

  repay = async (req: Request, res: Response) => {
    const businessId = req.user?.businessId;
    const branchId = req.user?.branchId;

    if(!businessId) return res.status(401).json({ message: "Business ID does not exist"});
    if(!branchId) return res.status(401).json({ message: " BranchId does not exist"})
    const rawId = req.params.liabilityId;
    const liabilityId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!liabilityId) return res.status(400).json({ message: "LiabilityId does not exist" });
    const dto = req.body.payload

    const result = await this.liabilityService.repayLiability(liabilityId, businessId, branchId, dto);
    res.json(result);
  };
}
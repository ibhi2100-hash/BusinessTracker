import type { Request, Response } from "express";
import { BranchService } from "../service/branch.service.js";


export class BranchController {
    constructor(private branchService: BranchService){}
    getBusinessBranch = async ( req: Request, res: Response)=> {
        const businessId = req.user?.businessId

        if(!businessId) {
            res.status(401).json({ message: "Business id not found"})
        }

        const result = await this.branchService.getBusinessBranch(businessId!);

        return res.status(201).json(result)
    }
}
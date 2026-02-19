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

    createBranch = async (req: Request, res: Response)=> {
    try{ 
        const businessId = req.user?.businessId!

        if(!businessId) {
            res.status(401).json({ message: "Business id not found"})
        }

        const result = await this.branchService.creatBranch(businessId, req.body);
        return res.status(201).json(result)

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error"})
    }

    }
}
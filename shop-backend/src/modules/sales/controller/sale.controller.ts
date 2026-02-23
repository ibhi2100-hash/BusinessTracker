import type { Request, Response } from "express";
import { SaleService } from "../service/sale.service.js";




export class SaleController {
    constructor( private saleService: SaleService){}

    async createSale(req: Request, res: Response){
        try{
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "businessId not found in user context" })
            }
            const branchId = req.user?.branchId;
            if(!branchId) throw new Error("branch id does not exist")
            const dto = req.body;
            
            const sale = await this.saleService.createSale(dto, businessId, branchId)

            res.status(201).json(sale);

        }catch(error){
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }

    async refundSale(req: Request, res: Response){
        try {
            const businessId = req.user?.businessId;
              if(!businessId) {
                return res.status(400).json({ message: "businessId not found in user context" })
            }
            const branchId = req.user?.branchId;
            if(!branchId)  return res.status(400).json({ message: "branchId does not exist"});
            const dto = req.body;
            const refund = await this.saleService.refundSale(dto.saleId, businessId, branchId)
            return res.status(201).json(refund)
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
}
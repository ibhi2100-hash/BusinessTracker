import type { Request, Response } from "express";
import { SaleService } from "../service/sale.service.js";

const saleService = new SaleService();


export class SaleController {
    async createSale(req: Request, res: Response){
        try{
            const businessId = req.user?.businessId;
            if(!businessId) {
                return res.status(400).json({ message: "businessId not found in user context" })
            }
            const dto = req.body;
            const sale = await saleService.createSale(dto, businessId)

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
            const dto = req.body;
            const refund = await saleService.refundSale(dto.saleId, businessId)
            return res.status(201).json(refund)
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : String(error)})
        }
    }
}
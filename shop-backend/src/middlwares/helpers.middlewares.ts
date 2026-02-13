import type { Request, Response, NextFunction } from "express";

export function requireBusiness (req: Request, res: Response, next: NextFunction) {
    if(!req.user?.businessId){
        return res.status(400).json({ message: "Business ID not found in user context"});
    }
    next();
}
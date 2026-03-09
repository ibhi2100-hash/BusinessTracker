import { Request, Response, NextFunction } from "express";
import { features } from "node:process";

export const requireFeature = ( feature: string ) => {
    return ( req: Request, res: Response, next: NextFunction) => {
        const subscription = req.subscription;

        if(!subscription?.subscription.features?.[feature]) {
            return res.status(403).json({
                message: " Upgrade your plan to access this feature "
            })

            next()
        }
    }
}
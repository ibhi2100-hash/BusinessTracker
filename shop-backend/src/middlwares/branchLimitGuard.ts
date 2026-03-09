import { Request, Response, NextFunction } from "express";
import { prisma } from "../infrastructure/postgresql/prismaClient.js";

export const branchLimitGuard = async (req: Request, res: Response, next: NextFunction) => {

  const businessId = req.user.businessId;
  const limit = req.subscription?.subscription.maxBranch;

  if(!limit) return res.status(401).json({ message: "There is no user limit"})
    
  const branchCount = await prisma.branch.count({
    where: { businessId }
  });

  if (branchCount >= limit) {
    return res.status(403).json({
      message: "Branch limit reached. Upgrade plan."
    });
  }

  next();
};
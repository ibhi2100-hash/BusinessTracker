import { Request, Response, NextFunction, response } from "express";
import { prisma } from "../infrastructure/postgresql/prismaClient.js";

export const userLimitGuard = async (req: Request, res: Response, next: NextFunction) => {

  const businessId = req.user?.businessId;
  const limit = req.subscription?.subscription.maxUsers;

  if(!limit) return res.status(401).json({ message: "There is no user limit"})

  const userCount = await prisma.user.count({
    where: { businessId}
  })

  if (userCount >= limit) {
    return res.status(403).json({
      message: "User limit reached. Upgrade your subscription."
    });
  }

  next();
};
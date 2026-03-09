import { prisma } from "../infrastructure/postgresql/prismaClient.js";
import { Request, Response, NextFunction } from "express";

export const subscriptionResolver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      return res.status(401).json({
        message: "Unauthorized: business not found",
      });
    }

    const subscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId,
      },
      include: {
        subscription: true,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "No subscription found",
      });
    }

    // Trial handling
    const now = new Date();

    if (subscription.trialEndDate && subscription.trialEndDate > now) {
      req.subscription = subscription;
      return next();
    }

    if (subscription.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Subscription inactive",
      });
    }

    req.subscription = subscription;

    next();
  } catch (error) {
    next(error);
  }
};
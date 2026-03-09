import { Request, Response, NextFunction } from "express";

export const subscriptionStatusGuard = (req: Request, res: Response, next: NextFunction) => {

  const subscription = req.subscription;

  if (!subscription) {
    return res.status(403).json({
      message: "No active subscription"
    });
  }

  if (subscription.status !== "ACTIVE") {
    return res.status(403).json({
      message: "Subscription inactive"
    });
  }

  if (subscription.trialEndDate && new Date() > subscription.trialEndDate) {
    return res.status(403).json({
      message: "Trial expired"
    });
  }

  next();
};
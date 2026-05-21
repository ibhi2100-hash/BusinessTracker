import { Request, Response, NextFunction } from "express";

export const requireFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const subscription = req.subscription;

    const features = subscription?.subscription.features;

    if (
      !features ||
      typeof features !== "object" ||
      Array.isArray(features)
    ) {
      return res.status(403).json({
        message: "Invalid subscription configuration",
      });
    }

    const featureMap = features as Record<string, boolean>;

    if (!featureMap[feature]) {
      return res.status(403).json({
        message: "Upgrade your plan to access this feature",
      });
    }

    return next();
  };
};
import type { Request, Response, NextFunction } from "express";
export function requireBranch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.branchId) {
    return res.status(400).json({
      message: "Active branch required",
    });
  }
  next();
}

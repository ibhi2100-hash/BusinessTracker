import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/auth-user.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  userId: string;
  businessId: string;
  branchId: string;
  role: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId ) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const authUser: AuthUser = {
      id: decoded.userId,
      businessId: decoded.businessId,
      role: decoded.role,
      branchId: decoded.branchId
    };

    req.user = authUser;

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

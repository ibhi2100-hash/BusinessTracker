
import {
  Request,
  Response,
  NextFunction,
} from "express";

import { TokenService } from "../modules/auth/service/token.service.js";
import { AuthUser } from "../types/auth-user.js";

const tokenService = new TokenService();

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Unauthorized: Bearer token required",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authorization header",
      });
    }

    const decoded =
      tokenService.verifyAccessToken(token);

    if (!decoded.userId || !decoded.businessId) {
      return res.status(401).json({
        message: "A valid business access token is required",
      });
    }

    const authUser: AuthUser = {
      id: decoded.userId,
      email: decoded.email,
      businessId: decoded.businessId,
      branchId: decoded.branchId!,
      role: decoded.role as "ADMIN" | "STAFF",
    };

    req.user = authUser;

    return next();

  } catch {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

import { Request, Response, NextFunction } from "express";
import { TokenService } from "../modules/auth/service/token.service.js";
import { AuthUser } from "../types/auth-user.js";

const tokenService = new TokenService();

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authorization =
            req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                message: "Unauthorized please no token in Bearer",
            });
        }

        const [scheme, token] =
            authorization.split(" ");

        if (
            scheme !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const decoded =
            tokenService.verifyAccessToken(token);

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        const authUser: AuthUser = {
            id: decoded.userId,
            email: decoded.email,
            businessId: decoded.businessId!,
            branchId: decoded.branchId!,
            role: decoded.role as "ADMIN" | "STAFF",
        };

        req.user = authUser;

        next();

    } catch {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
}
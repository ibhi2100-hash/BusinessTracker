import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import { PlatformIdentityService } from "../../modules/platform/identity/services/platform-indentity.service.js";

interface AuthenticatedPlatformRequest extends Request {
  platformUser?: {
    id: string;
    sessionId: string;
  };
}

export function requirePlatformPermission(
  identityService: PlatformIdentityService,
  permissionCode: string
): RequestHandler {
  return async (
    req: AuthenticatedPlatformRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const platformUserId = req.platformUser?.id;

      if (!platformUserId) {
        return res.status(401).json({
          message: "Platform authentication required",
        });
      }

      const allowed = await identityService.hasPermission(
        platformUserId,
        permissionCode
      );

      if (!allowed) {
        return res.status(403).json({
          message: "Insufficient platform permissions",
          requiredPermission: permissionCode,
        });
      }

      next();
    } catch {
      return res.status(500).json({
        message: "Unable to verify platform permissions",
      });
    }
  };
}
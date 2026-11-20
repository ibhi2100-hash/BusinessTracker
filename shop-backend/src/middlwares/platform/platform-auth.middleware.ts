import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import { PlatformIdentityService } from "../../modules/platform/identity/services/platform-indentity.service.js"; 

interface PlatformTokenVerifier {
  verify(token: string): Promise<{
    sub: string;
    sessionId: string;
  }>;
}

interface AuthenticatedPlatformRequest extends Request {
  platformUser?: {
    id: string;
    sessionId: string;
  };
}

export function createPlatformAuthMiddleware(
  tokenVerifier: PlatformTokenVerifier,
  identityService: PlatformIdentityService
): RequestHandler {
  return async (
    req: AuthenticatedPlatformRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Platform authentication required",
        });
      }

      const token = authorization.slice(7);

      const payload = await tokenVerifier.verify(token);

      if (!payload.sub || !payload.sessionId) {
        return res.status(401).json({
          message: "Invalid platform access token",
        });
      }

      const valid = await identityService.validateAccessSession(
        payload.sub,
        payload.sessionId
      );

      if (!valid) {
        return res.status(401).json({
          message: "Platform session is no longer active",
        });
      }

      req.platformUser = {
        id: payload.sub,
        sessionId: payload.sessionId,
      };

      next();
    } catch {
      return res.status(401).json({
        message: "Platform authentication failed",
      });
    }
  };
}
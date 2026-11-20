import { randomUUID } from "node:crypto";

import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export const platformRequestContext: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate a server-owned ID. Do not trust an arbitrary
  // client-supplied correlation ID as the canonical identifier.
  const correlationId = randomUUID();

  req.correlationId = correlationId;

  res.setHeader(
    "X-Correlation-ID",
    correlationId
  );

  next();
};
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../infrastructure/postgresql/prismaClient.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

interface JwtUserPayload {
  id: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
  const token = req.cookies.token

if (!token) {
  return res.status(401).json({ message: "Unauthorized" });
}

    const decoded = jwt.verify(token, JWT_SECRET as string);

    if(typeof decoded !== 'object' || !('id' in decoded)) {
        return res.status(401).json({ message: "decoded token is object" });
    }
    const { id } = decoded as JwtUserPayload;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      businessId: user.businessId,
      createdAt: user.createdAt,
      isActive: user.isActive
    };

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

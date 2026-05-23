import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { prisma } from "../infrastructure/postgresql/prismaClient.js";
import { signAccessTokenWithExpiry, signRefreshTokenWithExpiry } from "../helpers/jwtHelper/jwthelper.js";
import { setAuthCookies } from "../lib/cookies.js";

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const payload: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    );

    const session = await prisma.session.findUnique({
      where: {
        id: payload.sessionId,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return res.sendStatus(401);
    }
    if(!session.user.businessId) {
      return res.status(400).json({ message: "Invalid user data" });
    }
    if(!session.user.branchId){
        return res.status(400).json({ message: "Invalid user data" });
    }

    if (session.expiresAt < new Date()) {
      return res.sendStatus(401);
    }

    const accessToken = signAccessTokenWithExpiry(
      session.user.id,
      session.user.email,
      session.user.businessId,
      session.user.branchId,
      session.user.role
    );

    const refreshToken = signRefreshTokenWithExpiry(
      session.user.id,
      session.user.email,
      session.user.businessId,
      session.user.branchId,
      session.user.role
    );
    const accessedToken  = accessToken.token;
    const refreshedToken = refreshToken.token;

    setAuthCookies(
      res,
      accessedToken,
      refreshedToken

    );

    res.json({
      success: true,
    });
  } catch {
    return res.sendStatus(401);
  }
}
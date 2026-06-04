// token.service.ts

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  businessId?: string;
  branchId?: string;
}

export class TokenService {
  generateAccessToken(payload: JwtPayload) {
    const expiresIn = 15 * 60;

    const token = jwt.sign(
      payload,
      ACCESS_SECRET,
      {
        expiresIn,
      }
    );

    return {
      token,
      expiresIn,
    };
  }

  generateRefreshToken(payload: JwtPayload) {
    const expiresIn =
      30 * 24 * 60 * 60;

    const token = jwt.sign(
      payload,
      REFRESH_SECRET,
      {
        expiresIn,
      }
    );

    return {
      token,
      expiresIn,
    };
  }

  verifyAccessToken(token: string) {
    return jwt.verify(
      token,
      ACCESS_SECRET
    ) as JwtPayload;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      REFRESH_SECRET
    ) as JwtPayload;
  }
}
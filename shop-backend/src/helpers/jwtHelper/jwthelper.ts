import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}


/**
 * Sign JWT and return token + expiry in seconds
 */
export function signAccessTokenWithExpiry(
  userId: string,
  email: string,
  role: string,
  businessId?: string,
  branchId?: string
): { token: string; expiresIn: number } {
  const expiresIn = 15 * 60; // 15 minutes in seconds
  const token = jwt.sign(
    { userId, email, role, businessId, branchId },
    JWT_ACCESS_SECRET,
    { expiresIn }
  );
  return { token, expiresIn };
}

export function signRefreshTokenWithExpiry(
  userId: string,
  email: string,
  role: string,
  businessId?: string,
  branchId?: string
): { token: string; expiresIn: number } {
  const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds
  const token = jwt.sign(
    { userId, email, role, businessId, branchId },
    JWT_REFRESH_SECRET,
    { expiresIn }
  );
  return { token, expiresIn };
}
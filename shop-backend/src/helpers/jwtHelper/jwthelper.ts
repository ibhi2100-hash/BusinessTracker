import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * Sign JWT and return token + expiry in seconds
 */
export function signTokenWithExpiry(
  userId: string,
  role: string,
  businessId?: string,
  branchId?: string
): { token: string; expiresIn: number } {
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  const token = jwt.sign(
    { userId, role, businessId, branchId },
    JWT_SECRET,
    { expiresIn }
  );
  return { token, expiresIn };
}
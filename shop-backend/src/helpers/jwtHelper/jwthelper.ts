import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
export function signToken (userId: string, role: string, businessId?: string): string {
    return jwt.sign({ id: userId, role, businessId }, JWT_SECRET, { expiresIn: '7d' });
}